
import { Inject } from 'typescript-ioc';

import { WebsocketCommandHandler } from '../helpers';
import { GameServerResponse } from '../interfaces';

export class GameloopWorker {

  @Inject private wsCommands!: WebsocketCommandHandler;

  start() {
    process.on('message', msg => this.handleMessage(msg));
  }

  private async handleMessage(msg) {
    const { socketId, type, ...args } = msg;

    try {
      const res = await this.wsCommands.doAction(type, args);
      this.emit(socketId, res);
    } catch (e) {
      this.emit(socketId, { type: GameServerResponse.Error, error: e.message });
    }
  }

  private emit(socketId, data) {
    process.send!({ socketId, ...data });
  }

}
