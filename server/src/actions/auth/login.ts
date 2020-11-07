import * as meta from '../../../content/_output/meta.json';
import { Game } from '../../helpers';
import { GameAction, GameServerEvent, GameServerResponse } from '../../interfaces';
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
      account = await game.accountDB.getAccount(data.username);
    } catch (e) {
      game.logger.error('LoginAction#getAccount', e);
      throw new Error('Could not get account; try again.');
    }

    if (!account) throw new Error(`Username not registered.`);

    if (!game.accountDB.checkPassword(data, account)) throw new Error('Password does not match.');

    try {

      game.lobbyManager.removeAccount(data.username);

      const simpleAccount = await game.accountDB.simpleAccount(account);
      broadcast({
        action: GameAction.ChatAddUser,
        user: simpleAccount
      });

      register(data.username);

      game.lobbyManager.addAccount(account);

      game.logger.log('Auth:Login', `${data.username} logged in.`);

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

      for (const player of account.players) {
        emit({
          action: GameAction.SetCharacterSlotInformation,
          slot: player.charSlot,
          characterInfo: player
        });
      }

    } catch (e) {
      game.logger.error('LoginAction', e);
      throw new Error('Could not login username?');
    }
  }
}
