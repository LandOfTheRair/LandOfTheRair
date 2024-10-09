import 'reflect-metadata';

import { parentPort } from 'worker_threads';

import { once } from 'events';
import { WebsocketCommandHandler } from '../helpers';
import { consoleError, consoleLog } from '../helpers/core/logger/console';
import { GameEvent, GameServerResponse } from '../interfaces';

export class GameloopWorker {
  private wsCommands: WebsocketCommandHandler;

  async start() {
    consoleLog('GAME:Init', 'Starting game loop...');

    parentPort?.on('message', (message) => {
      this.handleMessage(message);
    });

    process.on('unhandledRejection', (error: any) => {
      const blacklistedErrors = ['ConnectTimeoutError'];
      if (blacklistedErrors.some((b) => error.name?.includes(b))) {
        return;
      }

      consoleError('GAME:UR', error);
    });

    process.on('uncaughtException', (error) => {
      consoleError('GAME:UE', error);
    });

    consoleLog('GAME:Init', 'Creating WSCMD...');
    this.wsCommands = new WebsocketCommandHandler();
    this.wsCommands.init((id, data) => this.emit(id, data));

    await once(this.wsCommands.game.gameEvents, GameEvent.GameStarted);
    parentPort?.postMessage({ target: 'networking', __ready: true });
  }

  // parse / send to the appropriate API command
  private async handleMessage(msg) {
    const { socketId, type, ...args } = msg;
    if (!type) {
      this.emit(socketId, {
        type: GameServerResponse.Error,
        error: 'You must specify a `type` when sending commands.',
      });
      return;
    }

    try {
      await this.wsCommands.doAction(type, args, socketId);
    } catch (e) {
      const blacklistedErrors = ['Not logged in.', 'Not in game.'];

      if (!blacklistedErrors.includes((e as Error).message)) {
        consoleError('GAME:ERROR:CMD', e);
        consoleError('GAME:ERROR:DATA', msg);

        if (process.env.NODE_ENV !== 'production') {
          this.emit(socketId, {
            type: GameServerResponse.Error,
            error: (e as Error).message,
          });
        }
      }
    }
  }

  // send to networking loop
  private emit(socketId, data) {
    parentPort?.postMessage({ target: 'networking', socketId, ...data });
  }
}
