
import fastify from 'fastify';
import rateLimit from 'fastify-rate-limit';
import * as HTTPRoutes from '../http';

import { WebSocketServer } from '@clusterws/cws';

export const start = async () => {

  // set up IPC
  const handle = (msg: any) => {
    console.log('handle net', msg);
  };

  process.on('message', handle);

  // set up HTTP
  const app = fastify();

  if(process.env.NODE_ENV === 'production') {
    app.register(rateLimit, {
      max: 10,
      timeWindow: 15 * 1000
    });
  }
  
  Object.values(HTTPRoutes).forEach((route) => route.setup(app));

  app.listen(process.env.PORT ? +process.env.PORT : 6975, (err: any) => {
    if(err) throw err;

    console.log(`Started HTTP server on port ${process.env.PORT || 6975}.`);
  });

  // set up WS
  const wsServer = new WebSocketServer({
    server: app.server
  });

  wsServer.startAutoPing(20000);

  // wsServer.broadcast

  wsServer.on('connection', (socket) => {
    socket.on('message', (msg) => {
      console.log(msg);
    });

    socket.on('close', (code, reason) => {
      if(code !== 1001) {
        console.log('[Socket DC]', code, reason);
      }
    });

    socket.on('error', (err) => {
      console.error(`[Socket Error]`, err);
    });

    // socket.send

    // socket.terminate
  });

  wsServer.on('error', (err) => {
    console.error(`[WS Server Error]`, err);
  });
};