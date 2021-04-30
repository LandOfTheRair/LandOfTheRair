import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ChangeEmailAction extends ServerAction {
  override type = GameServerEvent.ChangeEmail;
  override requiredKeys = ['newEmail'];
  override requiresLoggedIn = true;

  override async act(game: Game, callbacks, data) {

    if (!data.newEmail)                                      return { message: 'Must specify email.' };
    if (!data.newEmail.includes('.')
    || !data.newEmail.includes('@'))                         return { message: 'Email must match basic format.' };

    game.accountDB.changeEmail(data.account, data.newEmail);
    game.lobbyManager.updateAccount(data.account);

    return { wasSuccess: true, message: `Your account email is now ${data.newEmail}!` };
  }
}
