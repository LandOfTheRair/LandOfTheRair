import type { IServerGame } from '@lotr/interfaces';
import { GameServerEvent } from '@lotr/interfaces';

import { ServerAction } from '../../models/ServerAction';

export class VerifyRequestAction extends ServerAction {
  override type = GameServerEvent.RequestVerification;
  override requiredKeys = [];
  override requiresLoggedIn = true;

  override async act(game: IServerGame, callbacks, data) {
    const account = data.account;

    if (account.emailVerified) {
      return { wasSuccess: false, message: 'Your email is already verified!' };
    }

    if (account.verificationCode) {
      return {
        wasSuccess: false,
        message: 'You already have a verification code active. Please wait.',
      };
    }

    try {
      await game.emailHelper.requestVerificationCode(data.account);
    } catch {
      return {
        wasSuccess: false,
        message:
          'The email server is not configured, so your request was not completed.',
      };
    }

    return {
      wasSuccess: true,
      message: `A verification code has been sent to ${account.email}!`,
    };
  }
}
