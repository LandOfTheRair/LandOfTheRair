
import fastify from 'fastify';
import rateLimit from 'fastify-rate-limit';
import * as HTTPRoutes from '../http';

import uuid from 'uuid/v4';

import { WebSocketServer } from '@clusterws/cws';

export class WebsocketWorker {

  private sockets: { [uuid: string]: any } = {};

  private wsServer: WebSocketServer;

  start() {

    // set up IPC
    process.on('message', msg => this.handleMessage(msg));

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

    wsServer.startAutoPing(20000);

    // wsServer.broadcast

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

      socket.on('close', (code, reason) => {
        delete this.sockets[socket.uuid];

        if (code !== 1001 && code !== 1000) {
          console.log('[Socket DC]', code, reason);
        }
      });

      socket.on('error', (err) => {
        console.error(`[Socket Error]`, err);
      });

      // socket.terminate
    });

    wsServer.on('error', (err) => {
      console.error(`[WS Server Error]`, err);
    });
  }

  private emit(socket, data) {
    process.send!({ socketId: socket.uuid, ...data });
  }

  private handleMessage({ socketId, ...data }) {

    const sendMessage = JSON.stringify(data);

    if (!socketId) {
      this.wsServer.broadcast(sendMessage);
      return;
    }

    const socket = this.sockets[socketId];
    if (!socket) return;

    socket.send(sendMessage);
  }

}
