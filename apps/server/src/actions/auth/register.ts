import type { IServerGame } from '@lotr/interfaces';
import {
  GameAction,
  GameServerEvent,
  GameServerResponse,
} from '@lotr/interfaces';

import { ServerAction } from '../../models/ServerAction';

import { coreCharSelect } from '@lotr/content';
import { consoleError, consoleLog } from '@lotr/logger';
import { hasProfanity } from '@lotr/shared';
import * as meta from '../../../content/_output/meta.json';

export class RegisterAction extends ServerAction {
  override type = GameServerEvent.Register;
  override requiredKeys = [];
  override requiresLoggedIn = false;

  override async act(game: IServerGame, { broadcast, emit, register }, data) {
    if (process.env.BLOCK_REGISTER) {
      return { message: 'Registrations are not enabled on this server.' };
    }

    if (!data.username) return { message: 'Must specify username.' };
    if (data.username.length < 2) {
      return { message: 'Username must be >2 characters.' };
    }
    if (data.username.length > 20) {
      return { message: 'Username must be <20 characters.' };
    }

    if (!data.password) return { message: 'Must specify password.' };
    if (data.password.length < 11) {
      return { message: 'Password must be >10 characters.' };
    }
    if (data.password.length > 256) {
      return { message: 'Password must be less than <256 characters.' };
    }

    if (!data.email) return { message: 'Must specify email.' };
    if (!data.email.includes('.') || !data.email.includes('@')) {
      return { message: 'Email must match basic format.' };
    }

    if (/[^A-Za-z0-9]/.test(data.username)) {
      return { message: 'Username must only have letters and numbers.' };
    }

    if (hasProfanity(data.username)) {
      return { message: 'Pick a different username.' };
    }

    const doesExist = await game.accountDB.doesAccountExist(data.username);
    if (doesExist) return { message: 'Username already registered.' };

    const doesExistEmail = await game.accountDB.doesAccountExistEmail(
      data.email,
    );
    if (doesExistEmail) return { message: 'Email already registered.' };

    try {
      const account = await game.accountDB.createAccount(data);
      if (!account) {
        return {
          message:
            'Could not register - you might be using a similar username or email to another account.',
        };
      }

      consoleLog('Auth:Register', `${data.username} registered.`);

      const simpleAccount = await game.accountDB.simpleAccount(account);

      broadcast({
        action: GameAction.ChatAddUser,
        user: simpleAccount,
      });

      register(account.username);
      game.lobbyManager.joinLobby(account);

      emit({
        type: GameServerResponse.Login,
        account,
        motd: game.worldDB.motd,
        onlineUsers: game.lobbyManager.simpleOnlineAccounts,
      });

      emit({
        action: GameAction.SetCharacterCreateInformation,
        charCreateInfo: coreCharSelect(),
      });

      emit({
        action: GameAction.SettingsSetAssetHash,
        assetHash: meta.hash,
      });

      emit({
        action: GameAction.SettingsSetServerTimestamp,
        serverTimestamp: Date.now(),
      });

      game.messageHelper.broadcastSystemMessage(
        `Welcome ${account.username} to Land of the Rair!`,
      );
    } catch (e) {
      consoleError('RegisterAction', e as Error);
      throw new Error('Could not register username?');
    }

    return {};
  }
}
