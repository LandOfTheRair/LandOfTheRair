import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class BlockGameAndKickAllAction extends ServerAction {
  override type = GameServerEvent.BlockAndKickAll;
  override canBeUnattended = true;
  override requiredKeys = [];

  override async act(game: Game, {}, data) {

    if (!game.lobbyManager.isConnectedGm(data.username)) return { message: 'Not a GM.' };

    try {
      // block game entry
      game.lobbyManager.toggleBlock();

      // kick everyone
      game.lobbyManager.onlineUsernames.forEach(username => {
        if (game.lobbyManager.hasJoinedGame(username)) {
          game.lobbyManager.forceLeaveGame(username);
        }
      });

    } catch (e) {
      game.logger.error('BlockGameAndKickAllAction', e);
      return { message: 'Could not kick all/block? I would normally say to contact a GM, but this is probably your fault.' };
    }

    return {};
  }
}
