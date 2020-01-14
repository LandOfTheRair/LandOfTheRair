import { Game } from '../../helpers';
import { GameAction, GameServerEvent, GameServerResponse } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

import * as meta from '../../../content/_output/meta.json';

export class RegisterAction extends ServerAction {
  type = GameServerEvent.Register;
  requiredKeys = [];
  requiresLoggedIn = false;

  async act(game: Game, { broadcast, emit, register }, data) {

    if (!data.username) throw new Error('Must specify username.');
    if (data.username.length < 2) throw new Error('Username must be >2 characters.');
    if (data.username.length > 20) throw new Error('Username must be <20 characters.');

    if (!data.password) throw new Error('Must specify password.');
    if (data.password.length < 10) throw new Error('Password must be >10 characters.');
    if (data.password.length > 256) throw new Error('Password must be less than <256 characters.');

    if (!data.email) throw new Error('Must specify email.');
    if (!data.email.includes('.') || !data.email.includes('@')) throw new Error('Email must match basic format.');

    if (game.profanityHelper.hasProfanity(data.username)) throw new Error('Pick a different username.');

    const doesExist = await game.accountDB.doesAccountExist(data);
    if (doesExist) throw new Error('Username already registered.');

    try {
      const res = await game.accountDB.createAccount(data);
      if (!res) throw new Error('Could not register.');

      const simpleAccount = await game.accountDB.simpleAccount(res);
      delete simpleAccount.password;
      delete simpleAccount.players;

      broadcast({
        action: GameAction.ChatAddUser,
        user: simpleAccount
      });

      register(data.username);
      game.lobbyManager.addAccount(res);

      emit({
        type: GameServerResponse.Login,
        account: res,
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

    } catch (e) {
      game.logger.error('RegisterAction', e);
      throw new Error('Could not register username?');
    }
  }
}
