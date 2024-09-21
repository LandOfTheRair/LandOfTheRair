import { GameAction, ILobbyCommand } from '../../../interfaces';

import { Game } from '../../core';

export class GiveSilverCommand implements ILobbyCommand {
  name = '/silver';
  syntax = '/silver <silver> <accountname> (account must be online)';

  async do(message: string, game: Game, emit: (args) => void) {
    const [cmd, silver, rest] = message.split(' ');

    if (!rest) return false;

    const account = game.lobbyManager.getAccount(rest);
    if (!account) return false;

    game.subscriptionHelper.modifyAccountSilver(account, +silver);

    emit({
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      message: `${account.username} was given ${silver} silver.`,
      from: '★System',
    });

    return true;
  }
}
