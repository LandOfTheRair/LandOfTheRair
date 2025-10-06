import type { ILobbyCommand } from '../../../interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../core';

export class LockGameCommand implements ILobbyCommand {
  name = '/lockgame';
  syntax = '/lockgame';

  async do(message: string, game: Game, emit: (args) => void) {
    game.lobbyManager.toggleBlock();

    emit(
      game.messageHelper.getSystemMessageObject(
        `Game entry is ${game.lobbyManager.isBlocked() ? 'BLOCKED' : 'no longer blocked'}.`,
      ),
    );

    return true;
  }
}
