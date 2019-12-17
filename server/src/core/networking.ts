
import fastify from 'fastify';
import rateLimit from 'fastify-rate-limit';
import * as HTTPRoutes from '../http';

import uuid from 'uuid/v4';

import { WebSocketServer } from '@clusterws/cws';
import { GameAction, GameServerEvent, GameServerResponse } from '../interfaces';

export class WebsocketWorker {

  private sockets: { [uuidOrUsername: string]: any } = {};

  private wsServer: WebSocketServer;

  async start() {

    // set up IPC
    process.on('message', msg => {
      if (msg.__ready) {
        this.setup();
        return;
      }

      this.handleMessage(msg);
    });

    process.on('unhandledRejection', (error) => {
      console.error('NET', `Unhandled Rejection`, error);
    });

    process.on('uncaughtException', (error) => {
      console.error('NET', `Uncaught Exception`, error);
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

    Object.values(HTTPRoutes).forEach((route) => route.setup(app));

    app.listen(process.env.PORT ? +process.env.PORT : 6975, (err: any) => {
      if (err) throw err;

      console.log('NET', `Started HTTP server on port ${process.env.PORT || 6975}.`);
    });

    // set up WS
    const wsServer = new WebSocketServer({
      server: app.server
    });

    this.wsServer = wsServer;

    // prevent disconnects by doing a heartbeat
    wsServer.startAutoPing(20000);

    wsServer.on('connection', (socket) => {
      socket.uuid = uuid();

      this.sockets[socket.uuid] = socket;

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
        console.error('NET', `[Socket Error]`, err);
      });
    });

    wsServer.on('error', (err) => {
      console.error('NET', `[WS Server Error]`, err);
    });
  }

  // send to game loop
  private emit(socket, data) {
    process.send!({ socketId: socket.uuid, username: socket.username, ...data });
  }

  private transformData(data) {
    return JSON.stringify(data);
  }

  // emit message directly to socket
  private sendToSocket(socket, data) {
    const sendMessage = this.transformData(data);
    socket.send(sendMessage, { binary: true, compress: true });
  }

  // broadcast to all sockets
  private broadcast(data) {
    if (!this.wsServer) return;

    const sendMessage = this.transformData(data);
    this.wsServer.broadcast(sendMessage);
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
        delete this.sockets[socket.username];
        this.sendToSocket(oldSocket, { action: GameAction.Logout, manualDisconnect: true, kick: true });
        oldSocket.close(5000, 'disconnected from another login location');
      }

      this.sockets[socket.username] = socket;
    }

    this.sendToSocket(socket, data);
  }

}
