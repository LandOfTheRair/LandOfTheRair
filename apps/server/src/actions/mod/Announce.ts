import { GameServerEvent } from '@lotr/interfaces';

import { consoleError } from '@lotr/logger';
import type { Game } from '../../helpers';
import { ServerAction } from '../../models/ServerAction';

export class AnnounceAction extends ServerAction {
  override type = GameServerEvent.Announce;
  override canBeUnattended = true;
  override requiredKeys = ['message'];

  // eslint-disable-next-line no-empty-pattern
  override async act(game: Game, {}, data) {
    if (!game.lobbyManager.isConnectedGm(data.username)) {
      return { message: 'Not a GM.' };
    }

    try {
      game.messageHelper.broadcastSystemMessage(data.message);
    } catch (e) {
      consoleError('AnnounceAction', e as Error);
      return {
        message:
          'Could not announce? I would normally say to contact a GM, but this is probably your fault.',
      };
    }

    return {};
  }
}
