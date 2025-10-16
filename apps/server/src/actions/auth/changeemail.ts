import type { IServerGame } from '@lotr/interfaces';
import { GameServerEvent } from '@lotr/interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ChangeEmailAction extends ServerAction {
  override type = GameServerEvent.ChangeEmail;
  override requiredKeys = ['newEmail'];
  override requiresLoggedIn = true;

  override async act(game: IServerGame, callbacks, data) {
    if (!data.newEmail) return { message: 'Must specify email.' };
    if (!data.newEmail.includes('.') || !data.newEmail.includes('@')) {
      return { message: 'Email must match basic format.' };
    }

    const doesExistEmail = await game.accountDB.doesAccountExistEmail(
      data.newEmail,
    );
    if (doesExistEmail) return { message: 'Email already registered.' };

    try {
      game.accountDB.changeEmail(data.account, data.newEmail);
    } catch {
      return {
        wasSuccess: false,
        message: 'Email already registered to a different account.',
      };
    }

    game.lobbyManager.updateAccount(data.account);

    return {
      wasSuccess: true,
      message: `Your account email is now ${data.newEmail}!`,
    };
  }
}
