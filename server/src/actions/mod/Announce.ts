import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class AnnounceAction extends ServerAction {
  type = GameServerEvent.Announce;
  canBeUnattended = true;
  requiredKeys = ['message'];

  async act(game: Game, {}, data) {

    const account = game.lobbyManager.getAccount(data.username);
    if ((!account || !account.isGameMaster) && data.username !== '★System') return { message: 'Not a GM.' };

    try {
      game.messageHelper.broadcastSystemMessage(data.message);

    } catch (e) {
      game.logger.error('AnnounceAction', e);
      return { message: 'Could not announce? I would normally say to contact a GM, but this is probably your fault.' };
    }

    return {};
  }
}
