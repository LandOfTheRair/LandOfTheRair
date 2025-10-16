import type { IServerGame } from '@lotr/interfaces';
import { GameAction, GameServerEvent } from '@lotr/interfaces';

import { consoleError, consoleLog } from '@lotr/logger';
import { ServerAction } from '../../models/ServerAction';

export class LogoutAction extends ServerAction {
  override type = GameServerEvent.Logout;
  override requiredKeys = ['username'];

  override async act(game: IServerGame, { broadcast, unregister }, data) {
    try {
      broadcast({
        action: GameAction.ChatRemoveUser,
        username: data.username,
      });

      unregister(data.username);

      if (game.lobbyManager.hasJoinedGame(data.username)) {
        game.lobbyManager.leaveGame(data.username);
      }

      if (game.lobbyManager.hasJoinedLobby(data.username)) {
        game.lobbyManager.leaveLobby(data.username);
      }

      consoleLog('Auth:Logout', `${data.username} logged out.`);
    } catch (e) {
      consoleError('LogoutAction', e as Error);
      throw new Error('Could not logout username?');
    }

    return {};
  }
}
