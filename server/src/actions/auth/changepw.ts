import { Game } from '../../helpers';
import { GameServerEvent, GameServerResponse } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ChangePasswordAction extends ServerAction {
  type = GameServerEvent.ChangePassword;
  requiredKeys = ['newPassword', 'oldPassword'];
  requiresLoggedIn = true;

  async act(game: Game, { emit }, data) {

    if (!data.oldPassword) throw new Error('Must specify old password.');

    if (!data.newPassword) throw new Error('Must specify password.');
    if (data.newPassword.length < 11) throw new Error('Password must be >10 characters.');
    if (data.newPassword.length > 256) throw new Error('Password must be less than <256 characters.');

    const doesPasswordMatch = await game.accountDB.checkPasswordString(data.account, data.oldPassword);
    if (!doesPasswordMatch) throw new Error('Old password is not correct.');

    try {

      await game.accountDB.changePassword(data.account, data.newPassword);
      game.logger.log('Auth:ChangePassword', `${data.username} changed password.`);

      emit({
        type: GameServerResponse.SendNotification,
        message: `Successfully changed your password.`
      });

    } catch (e) {
      game.logger.error('ChangePasswordAction', e);
      throw new Error('Could not change password?');
    }
  }
}
