import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class SetMOTDAction extends ServerAction {
  type = GameServerEvent.SetMOTD;
  requiredKeys = ['motd'];

  async act(game: Game, { broadcast }, data) {

    const account = game.lobbyManager.getAccount(data.username);
    if (!account || !account.isGameMaster) throw new Error('Not a GM.');

    try {

      game.worldDB.setMOTD(data.motd || '');

      broadcast({
        action: GameAction.ChatSetMOTD,
        motd: data.motd
      });

    } catch (e) {
      game.logger.error('SetMOTDAction', e);
      throw new Error('Could not set MOTD?');
    }

    return {};
  }
}
