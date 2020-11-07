import { Game } from '../../helpers';
import { GameServerEvent, GameServerResponse } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ChangeAlwaysOnlineAction extends ServerAction {
  type = GameServerEvent.ChangeAlwaysOnline;
  requiredKeys = ['alwaysOnline'];
  requiresLoggedIn = true;

  async act(game: Game, { emit }, data) {

    try {
      await game.accountDB.changeAlwaysOnline(data.account, data.alwaysOnline);
      game.logger.log('Auth:ChangeAlwaysOnline', `${data.username} changed always online.`);

      emit({
        type: GameServerResponse.SendNotification,
        message: `Successfully changed your always online status.`
      });

    } catch (e) {
      game.logger.error('ChangeAlwaysOnline', e);
      throw new Error('Could not change password?');
    }
  }
}
