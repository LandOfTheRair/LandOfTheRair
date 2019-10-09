
import fastify from 'fastify';
import rateLimit from 'fastify-rate-limit';
import * as HTTPRoutes from '../http';

import uuid from 'uuid/v4';

import { WebSocketServer } from '@clusterws/cws';
import { GameAction, GameServerResponse } from '../interfaces';

export class WebsocketWorker {

  private sockets: { [uuid: string]: any } = {};
  private logins: { [username: string]: any } = {};

  private wsServer!: WebSocketServer;

  async start() {

    // set up IPC
    process.on('message', msg => {
      if (msg.__ready) {
        this.setup();
        return;
      }

      this.handleMessage(msg);
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

      console.log(`Started HTTP server on port ${process.env.PORT || 6975}.`);
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
          console.error('Invalid message (cannot parse to JSON)', msg);
        }
      });

      socket.on('close', () => {
        delete this.sockets[socket.uuid];
        delete this.sockets[socket.username];

        /* not sure if I care about any of these at all, really
        if (code !== 1001 && code !== 1000 && code !== 5000) {
          console.log('[Socket DC]', code, reason);
        }
        */
      });

      socket.on('error', (err) => {
        console.error(`[Socket Error]`, err);
      });
    });

    wsServer.on('error', (err) => {
      console.error(`[WS Server Error]`, err);
    });
  }

  // send to game loop
  private emit(socket, data) {
    process.send!({ socketId: socket.uuid, ...data });
  }

  // emit message directly to socket
  private sendToSocket(socket, data) {
    const sendMessage = JSON.stringify(data);
    socket.send(sendMessage, { binary: true, compress: true });
  }

  // broadcast to all sockets
  private broadcast(data) {
    const sendMessage = JSON.stringify(data);
    this.wsServer.broadcast(sendMessage, { binary: true });
  }

  private handleMessage({ socketId, socketUsername, ...data }) {

    if (!socketId) {
      this.broadcast(data);
      return;
    }

    const socket = this.logins[socketUsername] || this.sockets[socketId];
    if (!socket) return;

    // the networking layer specifically watches for login events
    if (data.type === GameServerResponse.Login) {
      socket.username = data.username;

      // if we are already logged in somewhere else, we kick them
      const oldSocket = this.logins[socket.username];
      if (oldSocket) {
        this.sendToSocket(oldSocket, { action: GameAction.Logout, manualDisconnect: true, kick: true });
        oldSocket.close(5000, 'disconnected from another login location');
      }

      this.logins[socket.username] = socket;
    }

    this.sendToSocket(socket, data);
  }

}
