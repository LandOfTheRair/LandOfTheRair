import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { Account } from '../../models';
import { ServerAction } from '../../models/ServerAction';

export class BlockGameAndKickAllAction extends ServerAction {
  override type = GameServerEvent.BlockAndKickAll;
  override canBeUnattended = true;
  override requiredKeys = [];

  override async act(game: Game, {}, data) {

    const account = game.lobbyManager.getAccount(data.username);
    if ((!account || !account.isGameMaster) && data.username !== '★System') return { message: 'Not a GM.' };

    try {
      // block game entry
      game.lobbyManager.toggleBlock();

      // kick everyone
      game.lobbyManager.getAllAccountsInGame().forEach(userAccount => {
        game.lobbyManager.accountLeaveGame(userAccount as Account);

        game.wsCmdHandler.broadcast({
          action: GameAction.ChatUserLeaveGame,
          username: userAccount.username
        });

        game.wsCmdHandler.sendToSocket(userAccount.username, {
          action: GameAction.GameQuit
        });
      });

    } catch (e) {
      game.logger.error('BlockGameAndKickAllAction', e);
      return { message: 'Could not kick all/block? I would normally say to contact a GM, but this is probably your fault.' };
    }

    return {};
  }
}
