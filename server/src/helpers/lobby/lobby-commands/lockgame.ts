import { GameAction, ILobbyCommand } from '../../../interfaces';

import { Game } from '../../core';

export class LockGameCommand implements ILobbyCommand {
  name = '/lockgame';
  syntax = '/lockgame';

  async do(message: string, game: Game, emit: (args) => void) {
    game.lobbyManager.toggleBlock();

    emit({
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      message: `Game entry is ${game.lobbyManager.isBlocked() ? 'BLOCKED' : 'no longer blocked'}.`,
      from: '★System',
    });

    return true;
  }
}
