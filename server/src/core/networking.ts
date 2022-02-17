
import 'reflect-metadata';

import { parentPort } from 'worker_threads';

import fastify from 'fastify';
import cors from 'fastify-cors';
import rateLimit from 'fastify-rate-limit';

import uuid from 'uuid/v4';

import * as WebSocket from 'ws';
import * as HTTPRoutes from '../http';
import { GameAction, GameServerEvent } from '../interfaces';
import { Database } from '../helpers';

export class WebsocketWorker {

  private sockets: Record<string, any> = {};

  private wsServer: WebSocket.Server;

  async start() {
    console.info('NET', 'Starting network handler...');

    // set up IPC
    parentPort?.on('message', msg => {
      if (msg.__ready) {
        console.info('NET', 'Starting API server...');
        this.setup();
        return;
      }

      this.handleMessage(msg);
    });

    process.on('unhandledRejection', (error) => {
      console.error('NET', 'Unhandled Rejection', error);
    });

    process.on('uncaughtException', (error) => {
      console.error('NET', 'Uncaught Exception', error);
    });

  }

  public async setup() {

    // set up DB
    const database = new Database();
    await database.tryConnect('NET');
    // set up HTTP
    const app = fastify();

    if (process.env.NODE_ENV === 'production') {
      app.register(rateLimit, {
        max: 10,
        timeWindow: 15 * 1000
      });

      app.register(cors, {
        origin: [/\.rair\.land$/]
      });

    } else {
      app.register(cors);

    }

    const promises = Object.values(HTTPRoutes).map(async (route) => await route.setup(app, {
      database,
      broadcast: (data) => this.broadcast(data),
      sendToGame: (data) => this.sendInternalToGame(data)
    }));

    await Promise.all(promises);

    app.listen(process.env.PORT ? +process.env.PORT : 6975, process.env.BIND_ADDR || '127.0.0.1', (err: any) => {
      if (err) throw err;

      console.info('NET', `Started HTTP server on port ${process.env.PORT || 6975}.`);
    });

    // set up WS
    const wsServer = new WebSocket.Server({
      server: app.server
    });
    app.ready().then(() => {
      console.info('NET', 'Server is ready for connections.');
    });

    this.wsServer = wsServer;

    // prevent disconnects by doing a heartbeat
    // wsServer.startAutoPing(20000);

    wsServer.on('connection', (socket: any, req: any) => {
      socket.uuid = uuid();
      socket.isAlive = true;

      const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(/\s*,\s*/)[0] : req.socket.remoteAddress;
      socket.ip = ip;

      this.sockets[socket.uuid] = socket;

      socket.on('pong', () => {
        socket.isAlive = true;
      });

      socket.on('message', (msg) => {
        try {
          this.emit(socket, JSON.parse(msg as string));
        } catch (e) {
          console.error('NET', 'Invalid message (cannot parse to JSON)', msg);
          console.error('NET', e);
        }
      });

      socket.on('close', () => {
        delete this.sockets[socket.uuid];

        if (socket.username) {
          this.emit(socket, { type: GameServerEvent.Logout, username: socket.username });
          this.emit(socket, { type: GameServerEvent.QuitGame, username: socket.username });
        }

        /* not sure if I care about any of these at all, really
        if (code !== 1001 && code !== 1000 && code !== 5000) {
          console.info('[Socket DC]', code, reason);
        }
        */
      });

      socket.on('error', (err) => {
        const ignoredMessages: string[] = [];

        if (ignoredMessages.includes(err.message)) return;

        console.error('NET', '[Socket Error]', err);
      });
    });

    wsServer.on('error', (err) => {
      console.error('NET', '[WS Server Error]', err);
    });

    this.watchForDeadConnections();
  }

  private watchForDeadConnections() {
    setInterval(() => {
      this.wsServer.clients.forEach((socket: any) => {
        if (socket === (this.wsServer as any)) return;

        if (!socket.isAlive) return socket.terminate();

        socket.isAlive = false;
        socket.ping(() => {});
      });
    }, 30000);
  }

  // send to game loop
  private emit(socket, data) {

    if (data.type === GameServerEvent.Register && socket.username) {
      return;
    }

    // do some rate limiting so people don't spam the server
    if (data.type === GameServerEvent.DoCommand) {

      if (!socket.cooldown) socket.cooldown = Date.now() + 100;
      if (!socket.sends) socket.sends = 0;

      // you can send 5 commands every 100ms
      if (socket.sends > 5 && socket.cooldown > Date.now()) return;

      if (Date.now() > socket.cooldown) {
        socket.sends = 0;
        socket.cooldown = Date.now() + 100;
      }

      socket.sends++;
    }

    if (data.type === GameServerEvent.Logout) {
      this.sendToGame(socket, { type: GameServerEvent.Logout, username: socket.username });
      delete this.sockets[socket.username];
      delete socket.username;
      return;
    }

    if (data.type === GameServerEvent.Register && data.username) {
      socket.username = data.username;
    }

    if (data.type === GameServerEvent.Login && data.username) {

      if (socket.username) return;

      // if we are already logged in somewhere else, we kick them
      const oldSocket = this.sockets[data.username];
      if (oldSocket) {
        this.sendToSocket(oldSocket, { action: GameAction.Logout, manualDisconnect: true, kick: true });
        this.sendToGame(oldSocket, { type: GameServerEvent.Logout, username: data.username });

        oldSocket.username = null;
        delete this.sockets[data.username];

        oldSocket.close(1008, 'disconnected from another login location');
      }

      socket.username = data.username;
      this.sockets[data.username] = socket;
    }

    this.sendToGame(socket, data);

  }

  private sendInternalToGame(data) {
    parentPort?.postMessage({ target: 'gameloop', socketId: '★System', socketIp: '★System', username: '★System', ...data });
  }

  private sendToGame(socket, data) {
    parentPort?.postMessage({ target: 'gameloop', socketId: socket.uuid, socketIp: socket.ip, username: socket.username, ...data });
  }

  private transformData(data) {
    return JSON.stringify(data);
  }

  // emit message directly to socket
  private sendToSocket(socket, data) {
    const sendMessage = this.transformData(data);
    socket.send(sendMessage, { compress: true });
  }

  // broadcast to all sockets
  private broadcast(data) {
    if (!this.wsServer) return;

    const sendMessage = this.transformData(data);
    this.wsServer.clients.forEach(socket => {
      if (socket === (this.wsServer as any) || socket.readyState !== WebSocket.OPEN) return;
      socket.send(sendMessage);
    });
  }

  private handleMessage({ socketId, ...data }) {

    // if there is no id specified, we broadcast the data to everyone
    if (!socketId) {
      this.broadcast(data);
      return;
    }

    // look up the socket by id or username
    const socket = this.sockets[socketId];
    if (!socket) return;

    this.sendToSocket(socket, data);
  }

}
