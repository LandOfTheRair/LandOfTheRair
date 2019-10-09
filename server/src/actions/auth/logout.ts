import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class LogoutAction extends ServerAction {
  type = GameServerEvent.Logout;
  requiredKeys = ['username'];

  async act(game: Game, { broadcast }, data) {
    try {

      broadcast({
        action: GameAction.ChatRemoveUser,
        username: data.username
      });

      game.lobbyManager.removeAccount(data.username);

    } catch (e) {
      game.logger.error('LogoutAction', e);
      throw new Error('Could not logout username?');
    }
  }
}
