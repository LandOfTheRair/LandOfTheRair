import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class LogoutAction extends ServerAction {
  override type = GameServerEvent.Logout;
  override requiredKeys = ['username'];

  override async act(game: Game, { broadcast, unregister }, data) {
    try {

      broadcast({
        action: GameAction.ChatRemoveUser,
        username: data.username
      });

      unregister(data.username);

      if (game.lobbyManager.isAccountInGame(data.account)) {
        game.lobbyManager.accountLeaveGame(data.account);
      }

      game.lobbyManager.removeAccount(data.username);
      game.logger.log('Auth:Logout', `${data.username} logged out.`);

    } catch (e) {
      game.logger.error('LogoutAction', e);
      throw new Error('Could not logout username?');
    }

    return {};
  }
}
