import { Game } from '../../helpers';
import { GameAction, GameServerEvent, GameServerResponse } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

import * as meta from '../../../content/_output/meta.json';

export class LoginAction extends ServerAction {
  type = GameServerEvent.Login;
  requiredKeys = ['username', 'password'];
  requiresLoggedIn = false;

  async act(game: Game, { broadcast, emit, register }, data) {
    if (!data.username) throw new Error('Must specify username.');
    if (!data.password) throw new Error('Must specify password.');

    let account;
    try {
      account = await game.accountDB.getAccount(data.username);
    } catch (e) {
      game.logger.error('LoginAction#getAccount', e);
      throw new Error('Could not get account; try again.');
    }

    if (!account) throw new Error(`Username not registered.`);

    if (!game.accountDB.checkPassword(data, account)) throw new Error('Password does not match.');

    try {
      const simpleAccount = await game.accountDB.simpleAccount(account);
      delete simpleAccount.password;
      delete simpleAccount.players;

      broadcast({
        action: GameAction.ChatAddUser,
        user: simpleAccount
      });

      register(data.username);
      game.lobbyManager.addAccount(account);

      emit({
        type: GameServerResponse.Login,
        account,
        motd: game.lobbyManager.motd,
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
      game.logger.error('LoginAction', e);
      throw new Error('Could not login username?');
    }
  }
}
