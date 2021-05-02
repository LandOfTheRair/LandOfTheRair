import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class SetMOTDAction extends ServerAction {
  override type = GameServerEvent.SetMOTD;
  override requiredKeys = ['motd'];

  override async act(game: Game, { broadcast }, data) {

    if (!game.lobbyManager.isConnectedGm(data.username)) return { message: 'Not a GM.' };

    try {

      game.worldDB.setMOTD(data.motd || '');

      broadcast({
        action: GameAction.ChatSetMOTD,
        motd: data.motd
      });

    } catch (e) {
      game.logger.error('SetMOTDAction', e);
      return { message: 'Could not set MOTD? I would normally say to contact a GM, but this is probably your fault.' };
    }

    return {};
  }
}
