import * as meta from '../../../content/_output/meta.json';
import { Game } from '../../helpers';
import { GameAction, GameServerEvent, GameServerResponse } from '../../interfaces';
import { Account } from '../../models/orm';
import { ServerAction } from '../../models/ServerAction';

export class LoginAction extends ServerAction {
  type = GameServerEvent.Login;
  requiredKeys = ['username', 'password'];
  requiresLoggedIn = false;

  async act(game: Game, { broadcast, emit, register }, data) {
    if (!data.username) throw new Error('Must specify username.');
    if (!data.password) throw new Error('Must specify password.');

    let account;
    try {
      account = await game.accountDB.getAccountForLoggingIn(data.username);
    } catch (e) {
      game.logger.error('LoginAction#getAccount', e);
      throw new Error('Could not get account; try again.');
    }

    if (!account) throw new Error(`Username not registered.`);

    if (!game.accountDB.checkPassword(data, account)) throw new Error('Password does not match.');

    try {

      const realAccount = await game.accountDB.getAccount(data.username);
      if (!realAccount) throw new Error('Could not get real account from login.');

      game.lobbyManager.removeAccount(data.username);

      const simpleAccount = game.accountDB.simpleAccount(realAccount);

      broadcast({
        action: GameAction.ChatAddUser,
        user: simpleAccount
      });

      register(data.username);
      game.lobbyManager.addAccount(realAccount);

      game.logger.log('Auth:Login', `${data.username} logged in.`);

      emit({
        type: GameServerResponse.Login,
        account: game.db.prepareForTransmission(realAccount),
        motd: game.worldDB.motd,
        onlineUsers: game.lobbyManager.onlineUsers.map(a => game.accountDB.simpleAccount(a as Account))
      });

      emit({
        action: GameAction.SetCharacterCreateInformation,
        charCreateInfo: game.contentManager.charSelectData
      });

      emit({
        action: GameAction.SettingsSetAssetHash,
        assetHash: meta.hash
      });

      for (const player of realAccount.players) {
        emit({
          action: GameAction.SetCharacterSlotInformation,
          slot: player.charSlot,
          characterInfo: game.db.prepareForTransmission(player)
        });
      }

    } catch (e) {
      game.logger.error('LoginAction', e);
      throw new Error('Could not login username?');
    }

    return {};
  }
}
