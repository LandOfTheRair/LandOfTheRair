import type { IServerGame } from '@lotr/interfaces';
import { GameServerEvent } from '@lotr/interfaces';

import { lobbyGetOnlineUsernames, lobbyToggleBlockingGame } from '@lotr/core';
import { consoleError } from '@lotr/logger';
import { ServerAction } from '../../models/ServerAction';

export class BlockGameAndKickAllAction extends ServerAction {
  override type = GameServerEvent.BlockAndKickAll;
  override canBeUnattended = true;
  override requiredKeys = [];

  // eslint-disable-next-line no-empty-pattern
  override async act(game: IServerGame, {}, data) {
    if (!game.lobbyManager.isConnectedGm(data.username)) {
      return { message: 'Not a GM.' };
    }

    try {
      // block game entry
      lobbyToggleBlockingGame();

      // kick everyone
      lobbyGetOnlineUsernames().forEach((username) => {
        if (game.lobbyManager.hasJoinedGame(username)) {
          game.lobbyManager.forceLeaveGame(username);
        }
      });
    } catch (e) {
      consoleError('BlockGameAndKickAllAction', e as Error);
      return {
        message:
          'Could not kick all/block? I would normally say to contact a GM, but this is probably your fault.',
      };
    }

    return {};
  }
}
