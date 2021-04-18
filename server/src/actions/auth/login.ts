
import * as meta from '../../../content/_output/meta.json';
import { Game } from '../../helpers';
import { GameAction, GameServerEvent, GameServerResponse } from '../../interfaces';
import { Account } from '../../models/orm';
import { ServerAction } from '../../models/ServerAction';

export class LoginAction extends ServerAction {
  override type = GameServerEvent.Login;
  override requiredKeys = ['username', 'password'];
  override requiresLoggedIn = false;

  override async act(game: Game, { broadcast, emit, register }, data) {
    if (!data.username)                               return { wasSuccess: false, message: 'No username specified.' };
    if (!data.password)                               return { wasSuccess: false, message: 'No password specified.' };

    let account;
    try {
      account = await game.accountDB.getAccountForLoggingIn(data.username);
    } catch (e) {
      game.logger.error('LoginAction#getAccount', e);
      return { message: 'Could not get account; try again or contact a GM if this persists.' };
    }

    if (!account)                                     return { wasSuccess: false, message: 'Username not registered.' };

    if (!game.accountDB.checkPassword(data, account)) return { wasSuccess: false, message: 'Incorrect password.' };

    if (account.isBanned)                             return { wasSuccess: false, message: 'You are banned.' };

    try {

      const realAccount = await game.accountDB.getAccount(data.username);
      if (!realAccount)                               return { message: 'Could not get real account from login.' };

      game.accountDB.registerIP(data.username, data.socketIp);

      if (game.lobbyManager.isAccountInGame(realAccount)) {
        game.lobbyManager.accountLeaveGame(realAccount);
      }

      const simpleAccount = game.accountDB.simpleAccount(realAccount);

      broadcast({
        action: GameAction.ChatAddUser,
        user: simpleAccount
      });

      register(data.username);

      game.subscriptionHelper.checkAccountForExpiration(realAccount);

      game.lobbyManager.addAccount(realAccount);

      game.logger.log('Auth:Login', `${data.username} logged in (${data.socketIp}).`);

      emit({
        type: GameServerResponse.Login,
        account: game.db.prepareForTransmission(realAccount),
        motd: game.worldDB.motd,
        onlineUsers: game.lobbyManager.onlineUsers.map(a => game.accountDB.simpleAccount(a as Account)),
        currentHoliday: game.holidayHelper.currentHoliday()
      });

      emit({
        action: GameAction.SetCharacterCreateInformation,
        charCreateInfo: game.contentManager.charSelectData
      });

      emit({
        action: GameAction.SettingsSetAssetHash,
        assetHash: meta.hash
      });

      emit({
        action: GameAction.EventSetList,
        events: game.dynamicEventHelper.getEventsForPlayer()
      });

      const sortedPlayers = realAccount.players.reduce((prev, cur) => {
        prev[cur.charSlot] = cur;
        return prev;
      }, [] as any[]);

      for (let i = 0; i < sortedPlayers.length; i++) {

        const player = sortedPlayers[i];

        emit({
          action: GameAction.SetCharacterSlotInformation,
          slot: i,
          characterInfo: player ? game.db.prepareForTransmission(player) : null
        });
      }

    } catch (e) {
      game.logger.error('LoginAction', e);
      throw new Error('Could not login username?');
    }

    return {};
  }
}
