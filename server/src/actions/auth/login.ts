
import * as meta from '../../../content/_output/meta.json';
import { Game } from '../../helpers';
import { GameAction, GameServerEvent, GameServerResponse } from '../../interfaces';
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

      if (game.lobbyManager.hasJoinedGame(data.username)) {
        game.lobbyManager.leaveGame(data.username);
      }

      const simpleAccount = game.accountDB.simpleAccount(realAccount);

      broadcast({
        action: GameAction.ChatAddUser,
        user: simpleAccount
      });

      register(data.username);

      game.subscriptionHelper.checkAccountForExpiration(realAccount);

      game.lobbyManager.joinLobby(realAccount);

      game.logger.log('Auth:Login', `${data.username} logged in (${data.socketIp}).`);

      const sortedPlayers = realAccount.players.reduce((prev, cur) => {
        prev[cur.charSlot] = cur;
        return prev;
      }, [] as any[]);

      emit({
        type: GameServerResponse.Login,
        account: { ...game.db.prepareForTransmission(realAccount), players: sortedPlayers },
        motd: game.worldDB.motd,
        onlineUsers: game.lobbyManager.simpleOnlineAccounts,
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

      // if they manage to log in with a temporary password, change their password to their temporary one so it can be reset
      if (account.temporaryPassword) {
        game.accountDB.changePassword(realAccount, account.temporaryPassword);
      }

    } catch (e) {
      game.logger.error('LoginAction', e);
      throw new Error('Could not login username?');
    }

    return {};
  }
}
