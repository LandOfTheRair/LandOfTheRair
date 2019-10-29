
import { Inject, Singleton } from 'typescript-ioc';

import * as Actions from '../../actions';
import { GameServerEvent, IServerAction } from '../../interfaces';
import { Game } from './Game';

@Singleton
export class WebsocketCommandHandler {

  @Inject private game: Game;

  private actions: { [key: string]: IServerAction } = {};
  private accountSocketIds: { [username: string]: string } = {};

  private emitCallback: (id, data) => void;

  public async init(emitCallback: (id, data) => void) {
    this.emitCallback = emitCallback;

    Object.keys(Actions).forEach(actionKey => {
      const action: IServerAction = new Actions[actionKey]();

      this.actions[action.type] = action;
    });

    await this.game.init(this);
  }

  public async doAction(type: GameServerEvent, data: any, socketId: string): Promise<void> {

    const action = this.actions[type];
    if (!action) throw new Error(`Action type ${type} does not exist.`);

    if (!action.validate(data)) throw new Error(`Action type ${type} is not valid with keys ${JSON.stringify(data)}.`);

    const broadcast = (args) => this.emitCallback(null, args);
    const emit = (args) => this.emitCallback(socketId, args);
    const register = (username) => this.registerAccountSocket(username, socketId);
    const unregister = (username) => this.unregisterAccountSocket(username);

    if (action.requiresLoggedIn) {
      const account = await this.game.lobbyManager.getAccount(data.username);
      if (!account) throw new Error(`Not logged in.`);

      data.account = account;
    }

    await action.act(this.game, { broadcast, emit, register, unregister }, data);
  }

  public sendToSocket(username: string, data: any): void {
    this.emitCallback(this.accountSocketIds[username], data);
  }

  private registerAccountSocket(username: string, socketId: string) {
    this.accountSocketIds[username] = socketId;
  }

  private unregisterAccountSocket(username: string) {
    delete this.accountSocketIds[username];
  }
}
