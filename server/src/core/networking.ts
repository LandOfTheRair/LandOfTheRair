
import 'reflect-metadata';

import { parentPort } from 'worker_threads';

import fastify from 'fastify';
import rateLimit from 'fastify-rate-limit';

import uuid from 'uuid/v4';

import * as WebSocket from 'ws';
import * as HTTPRoutes from '../http';
import { GameAction, GameServerEvent, GameServerResponse } from '../interfaces';

export class WebsocketWorker {

  private sockets: { [uuidOrUsername: string]: any } = {};

  private wsServer: WebSocket.Server;

  async start() {
    console.log('NET', 'Starting network handler...');

    // set up IPC
    parentPort?.on('message', msg => {
      if (msg.__ready) {
        console.log('NET', 'Starting API server...');
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

  public setup() {

    // set up HTTP
    const app = fastify();

    if (process.env.NODE_ENV === 'production') {
      app.register(rateLimit, {
        max: 10,
        timeWindow: 15 * 1000
      });
    }

    Object.values(HTTPRoutes).forEach((route) => route.setup(app, { broadcast: (data) => this.broadcast(data) }));

    app.listen(process.env.PORT ? +process.env.PORT : 6975, process.env.BIND_ADDR || '127.0.0.1', (err: any) => {
      if (err) throw err;

      console.log('NET', `Started HTTP server on port ${process.env.PORT || 6975}.`);
    });

    // set up WS
    const wsServer = new WebSocket.Server({
      server: app.server
    });

    this.wsServer = wsServer;

    // prevent disconnects by doing a heartbeat
    // wsServer.startAutoPing(20000);

    wsServer.on('connection', (socket: any) => {
      socket.uuid = uuid();
      socket.isAlive = true;

      this.sockets[socket.uuid] = socket;

      socket.on('pong', () => {
        socket.isAlive = true;
      });

      socket.on('message', (msg) => {
        try {
          this.emit(socket, JSON.parse(msg as string));
        } catch (e) {
          console.error('NET', 'Invalid message (cannot parse to JSON)', msg);
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
          console.log('[Socket DC]', code, reason);
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

    // do some rate limiting so people don't spam the server
    if (data.type === GameServerEvent.DoCommand) {

      // you can send 5 commands every 100ms
      if (socket.sends > 5 && socket.cooldown > Date.now()) return;

      if (Date.now() > socket.cooldown) {
        socket.sends = 0;
        socket.cooldown = Date.now() + 100;
      }

      if (!socket.cooldown) socket.cooldown = Date.now() + 100;
      if (!socket.sends) socket.sends = 0;

      socket.sends++;
    }

    this.sendToGame(socket, data);

  }

  private sendToGame(socket, data) {
    parentPort?.postMessage({ target: 'gameloop', socketId: socket.uuid, username: socket.username, ...data });
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

    // the networking layer specifically watches for login events
    if (data.type === GameServerResponse.Login) {

      // if it already has a username, it's already logged in
      if (socket.username) {
        this.sendToSocket(socket, { type: GameServerResponse.Error, error: 'You are already logged in.' });
        return;
      }

      socket.username = data.account.username;

      // if we are already logged in somewhere else, we kick them
      const oldSocket = this.sockets[socket.username];
      if (oldSocket) {
        oldSocket.username = null;
        delete this.sockets[socket.username];
        this.sendToSocket(oldSocket, { action: GameAction.Logout, manualDisconnect: true, kick: true });
        oldSocket.close(5000, 'disconnected from another login location');
      }

      this.sockets[socket.username] = socket;
    }

    this.sendToSocket(socket, data);
  }

}
