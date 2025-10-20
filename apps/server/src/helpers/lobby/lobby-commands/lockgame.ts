import { lobbyBlockingGame, lobbyToggleBlockingGame } from '@lotr/lobby';
import type { ILobbyCommand } from '../../../interfaces';

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
