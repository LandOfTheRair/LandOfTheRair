import { lobbyBlockingGame, lobbyToggleBlockingGame } from '@lotr/core';
import type { ILobbyCommand } from '../../../interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IServerGame } from '@lotr/interfaces';

export class LockGameCommand implements ILobbyCommand {
  name = '/lockgame';
  syntax = '/lockgame';

  async do(message: string, game: IServerGame, emit: (args) => void) {
    lobbyToggleBlockingGame();

    emit(
      game.messageHelper.getSystemMessageObject(
        `Game entry is ${lobbyBlockingGame() ? 'BLOCKED' : 'no longer blocked'}.`,
      ),
    );

    return true;
  }
}
