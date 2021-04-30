import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class VerifySubmitAction extends ServerAction {
  override type = GameServerEvent.SubmitVerification;
  override requiredKeys = ['verificationCode'];
  override requiresLoggedIn = true;

  override async act(game: Game, callbacks, data) {

    const account = data.account;

    if (account.emailVerified) return { wasSuccess: false, message: 'Your email is already verified!' };

    if (!account.verificationCode) return { wasSuccess: false, message: 'You must first request a verification code.' };

    if (account.verificationCode !== data.verificationCode) return { wasSuccess: false, message: 'Invalid verification code.' };

    account.verificationCode = null;
    await game.accountDB.verifyEmail(data.account);
    game.lobbyManager.updateAccount(data.account);

    return { wasSuccess: true, message: 'Your email has been verified!' };
  }
}
