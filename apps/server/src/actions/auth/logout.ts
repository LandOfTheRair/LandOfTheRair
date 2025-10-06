import { GameAction, GameServerEvent } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../helpers';
import { ServerAction } from '../../models/ServerAction';

export class LogoutAction extends ServerAction {
  override type = GameServerEvent.Logout;
  override requiredKeys = ['username'];

  override async act(game: Game, { broadcast, unregister }, data) {
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

      game.logger.log('Auth:Logout', `${data.username} logged out.`);
    } catch (e) {
      game.logger.error('LogoutAction', e as Error);
      throw new Error('Could not logout username?');
    }

    return {};
  }
}
