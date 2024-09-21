import { GameAction, ILobbyCommand } from '../../../interfaces';

import { Game } from '../../core';

export class KickCommand implements ILobbyCommand {
  name = '/kick';
  syntax = '/kick <accountname> (account must be online)';

  async do(message: string, game: Game, emit: (args) => void) {
    const [cmd, rest] = message.split(' ');

    if (!rest) return false;

    if (!game.lobbyManager.hasJoinedGame(rest)) return false;

    game.lobbyManager.forceLeaveGame(rest);

    emit({
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      message: `${rest} was kicked from game.`,
      from: '★System',
    });

    return true;
  }
}
