import { Game } from '../../helpers';
import { GameAction, GameServerEvent, GameServerResponse } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

import * as meta from '../../../content/_output/meta.json';

export class RegisterAction extends ServerAction {
  type = GameServerEvent.Register;
  requiredKeys = [];
  requiresLoggedIn = false;

  async act(game: Game, { broadcast, emit, register }, data) {

    if (process.env.BLOCK_REGISTER)                       return { message: 'Registrations are not enabled on this server.' };

    if (!data.username)                                   return { message: 'Must specify username.' };
    if (data.username.length < 1)                         return { message: 'Username must be >2 characters.' };
    if (data.username.length > 20)                        return { message: 'Username must be <20 characters.' };

    if (!data.password)                                   return { message: 'Must specify password.' };
    if (data.password.length < 11)                        return { message: 'Password must be >10 characters.' };
    if (data.password.length > 256)                       return { message: 'Password must be less than <256 characters.' };

    if (!data.email)                                      return { message: 'Must specify email.' };
    if (!data.email.includes('.')
    || !data.email.includes('@'))                         return { message: 'Email must match basic format.' };

    if (game.profanityHelper.hasProfanity(data.username)) return { message: 'Pick a different username.' };

    const doesExist = await game.accountDB.doesAccountExist(data);
    if (doesExist)                                        return { message: 'Username already registered.' };

    try {
      const account = await game.accountDB.createAccount(data);
      if (!account)                                       return { message: 'Could not register.' };

      game.logger.log('Auth:Register', `${data.username} registered.`);

      const simpleAccount = await game.accountDB.simpleAccount(account);

      broadcast({
        action: GameAction.ChatAddUser,
        user: simpleAccount
      });

      broadcast({
        action: GameAction.ChatAddMessage,
        timestamp: Date.now(),
        message: `Welcome ${data.username} to Land of the Rair!`,
        from: '★System'
      });

      register(account.username);
      game.lobbyManager.addAccount(account);

      emit({
        type: GameServerResponse.Login,
        account,
        motd: game.worldDB.motd,
        onlineUsers: game.lobbyManager.onlineUsers
      });

      emit({
        action: GameAction.SetCharacterCreateInformation,
        charCreateInfo: game.contentManager.charSelectData
      });

      emit({
        action: GameAction.SettingsSetAssetHash,
        assetHash: meta.hash
      });

      game.messageHelper.broadcastSystemMessage(`Welcome ${account.username} to Land of the Rair!`);

    } catch (e) {
      game.logger.error('RegisterAction', e);
      throw new Error('Could not register username?');
    }

    return {};
  }
}
