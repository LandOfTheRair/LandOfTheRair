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

    if (Date.now() > account.verificationExpiration) return { wasSuccess: false, message: 'Verification code expired.' };

    account.verificationAttempts = account.verificationAttempts ?? 0;
    account.verificationAttempts++;

    if (account.verificationAttempts > 5) {
      delete account.verificationCode;
      delete account.verificationExpiration;
      delete account.verificationAttempts;
      return { wasSuccess: false, message: 'Too many attempts with wrong code.' };
    }

    if (account.verificationCode !== data.verificationCode) return { wasSuccess: false, message: 'Invalid verification code.' };

    delete account.verificationCode;
    delete account.verificationExpiration;
    delete account.verificationAttempts;

    await game.accountDB.verifyEmail(data.account);
    game.lobbyManager.updateAccount(data.account);

    return { wasSuccess: true, message: 'Your email has been verified!' };
  }
}
