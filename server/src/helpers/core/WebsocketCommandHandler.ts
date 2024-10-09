import { ReflectiveInjector, resolveDependencies } from 'injection-js';
import * as Actions from '../../actions';
import { consoleError, consoleLog } from '../../helpers/core/logger/console';
import {
  GameServerEvent,
  GameServerResponse,
  IServerAction,
} from '../../interfaces';
import { IWebsocketCommandHandler } from '../../interfaces/internal';
import { Game } from './Game';

export class WebsocketCommandHandler implements IWebsocketCommandHandler {
  public game: Game;

  constructor() {}

  private actions: Record<string, IServerAction> = {};
  private accountSocketIds: Record<string, string> = {};

  private emitCallback: (id, data) => void;

  public async init(emitCallback: (id, data) => void) {
    consoleLog('WSCMD', 'Initialzing WSCMD...');

    this.emitCallback = emitCallback;

    consoleLog('WSCMD', 'Loading WS actions...');
    Object.keys(Actions).forEach((actionKey) => {
      const action: IServerAction = new Actions[actionKey]();

      this.actions[action.type] = action;
    });

    consoleLog('WSCMD', 'Initializing injector...');
    const injector = ReflectiveInjector.resolveAndCreate(
      resolveDependencies(Game),
    );
    this.game = injector.get(Game);

    consoleLog('WSCMD', 'Starting game...');
    await this.game.init(this);
  }

  public async doAction(
    type: GameServerEvent,
    data: any,
    socketId: string,
  ): Promise<void> {
    const action = this.actions[type];
    if (!action) {
      this.game.logger.error(
        'WSCmdHandler',
        new Error(`Action type ${type} does not exist.`),
      );
      return;
    }

    if (!action.validate(data)) {
      this.game.logger.error(
        'WSCmdHandler',
        new Error(
          `Action type ${type} is not valid with keys ${JSON.stringify(data)}.`,
        ),
      );
      return;
    }

    const broadcast = (args) => this.emitCallback(null, args);
    const emit = (args) => this.emitCallback(socketId, args);
    const register = (username) =>
      this.registerAccountSocket(username, socketId);
    const unregister = (username) => this.unregisterAccountSocket(username);

    if (action.requiresLoggedIn && !action.canBeUnattended) {
      const account = this.game.lobbyManager.getAccount(data.username);
      if (!account) {
        const blacklistedActionsForLogging = [
          GameServerEvent.QuitGame,
          GameServerEvent.Logout,
        ];
        if (!blacklistedActionsForLogging.includes(action.type)) {
          consoleError(
            'WSCmdHandler',
            new Error(
              `Not logged in and trying to do ${type} with ${JSON.stringify(data)}.`,
            ),
          );
        }
        return;
      }

      data.account = account;
    }

    const res = await action.act(
      this.game,
      { broadcast, emit, register, unregister },
      data,
    );
    if (res && res.message) {
      if (res.wasSuccess) {
        emit({
          type: GameServerResponse.SendNotification,
          message: res.message,
        });
      } else {
        emit({
          type: GameServerResponse.Error,
          error: res.message,
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
