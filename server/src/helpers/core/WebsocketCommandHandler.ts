
import { ReflectiveInjector, resolveDependencies } from 'injection-js';
import * as Actions from '../../actions';
import { GameServerEvent, GameServerResponse, IServerAction } from '../../interfaces';
import { IWebsocketCommandHandler } from '../../interfaces/internal';
import { Game } from './Game';

export class WebsocketCommandHandler implements IWebsocketCommandHandler {

  private game: Game;

  constructor() {}

  private actions: Record<string, IServerAction> = {};
  private accountSocketIds: Record<string, string> = {};

  private emitCallback: (id, data) => void;

  public async init(emitCallback: (id, data) => void) {
    console.info('WSCMD', 'Initialzing WSCMD...');

    this.emitCallback = emitCallback;

    console.info('WSCMD', 'Loading WS actions...');
    Object.keys(Actions).forEach(actionKey => {
      const action: IServerAction = new Actions[actionKey]();

      this.actions[action.type] = action;
    });

    console.info('WSCMD', 'Initializing injector...');
    const injector = ReflectiveInjector.resolveAndCreate(resolveDependencies(Game));
    this.game = injector.get(Game);

    console.info('WSCMD', 'Starting game...');
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

    if (action.requiresLoggedIn && !action.canBeUnattended) {
      const account = this.game.lobbyManager.getAccount(data.username);
      if (!account) throw new Error('Not logged in.');

      data.account = account;
    }

    const res = await action.act(this.game, { broadcast, emit, register, unregister }, data);
    if (res && res.message) {

      if (res.wasSuccess) {
        emit({
          type: GameServerResponse.SendNotification,
          message: res.message
        });

      } else {
        emit({
          type: GameServerResponse.Error,
          error: res.message
        });
      }

    }
  }

  public broadcast(data): void {
    this.emitCallback(null, data);
  }

  public sendToSocket(username: string, data: any): void {

    // if they've disconnected, and something gets sent to them, it will technically be broadcast
    // that's not ideal, so we make sure we have somewhere to send this first
    if (!this.accountSocketIds[username]) return;
    this.emitCallback(this.accountSocketIds[username], data);
  }

  private registerAccountSocket(username: string, socketId: string) {
    this.accountSocketIds[username] = socketId;
  }

  private unregisterAccountSocket(username: string) {
    delete this.accountSocketIds[username];
  }
}
