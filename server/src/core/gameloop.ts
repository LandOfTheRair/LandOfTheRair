
import 'reflect-metadata';

import { parentPort } from 'worker_threads';

import { WebsocketCommandHandler } from '../helpers';
import { GameServerResponse } from '../interfaces';

export class GameloopWorker {

  private wsCommands: WebsocketCommandHandler;

  async start() {
    console.log('GAME', 'Starting game loop...');

    parentPort?.on('message', message => {
      this.handleMessage(message);
    });

    process.on('unhandledRejection', (error) => {
      console.error('GAME', 'Unhandled Rejection', error);
    });

    process.on('uncaughtException', (error) => {
      console.error('GAME', 'Uncaught Exception', error);
    });

    console.log('GAME', 'Creating WSCMD...');
    this.wsCommands = new WebsocketCommandHandler();
    await this.wsCommands.init((id, data) => this.emit(id, data));

    console.log('GAME', 'Sending ready signal...');

    parentPort?.postMessage({ target: 'networking', __ready: true });
  }

  // parse / send to the appropriate API command
  private async handleMessage(msg) {
    const { socketId, type, ...args } = msg;
    if (!type) {
      this.emit(socketId, { type: GameServerResponse.Error, error: 'You must specify a `type` when sending commands.' });
      return;
    }

    try {
      await this.wsCommands.doAction(type, args, socketId);
    } catch (e) {
      const blacklistedErrors = [
        'Not logged in.',
        'Not in game.'
      ];

      if (!blacklistedErrors.includes(e.message)) {
        console.error('ERROR: CMD', e);
        console.error('ERROR: DATA', msg);

        if (process.env.NODE_ENV !== 'production') {
          this.emit(socketId, { type: GameServerResponse.Error, error: e.message });
        }
      }
    }
  }

  // send to networking loop
  private emit(socketId, data) {
    parentPort?.postMessage({ target: 'networking', socketId, ...data });
  }

}
