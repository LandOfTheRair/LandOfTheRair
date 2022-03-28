import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ForgotPasswordAction extends ServerAction {
  override type = GameServerEvent.ForgotPassword;
  override requiredKeys = ['email'];
  override requiresLoggedIn = false;

  override async act(game: Game, callbacks, data) {

    const email = data.email;

    try {
      await game.emailHelper.requestTemporaryPassword(data.email);
    } catch (e: any) {
      return { wasSuccess: false, message: e.message };
    }

    return { wasSuccess: true, message: `A temporary password has been sent to ${email}!` };
  }
}
