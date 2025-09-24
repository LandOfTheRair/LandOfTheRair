import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class AnnounceAction extends ServerAction {
  override type = GameServerEvent.Announce;
  override canBeUnattended = true;
  override requiredKeys = ['message'];

  override async act(game: Game, {}, data) {
    if (!game.lobbyManager.isConnectedGm(data.username)) {
      return { message: 'Not a GM.' };
    }

    try {
      game.messageHelper.broadcastSystemMessage(data.message);
    } catch (e) {
      game.logger.error('AnnounceAction', e as Error);
      return {
        message:
          'Could not announce? I would normally say to contact a GM, but this is probably your fault.',
      };
    }

    return {};
  }
}
