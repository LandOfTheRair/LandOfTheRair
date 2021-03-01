
import { GameAction, ILobbyCommand } from '../../../interfaces';
import { Account } from '../../../models';

import { Game } from '../../core';

export class CreateGMCommand implements ILobbyCommand {
  name = '/creategm';
  syntax = '/creategm <accountname> (account must be online)';

  do(message: string, game: Game, emit: (args) => void) {
    const [cmd, rest] = message.split(' ');

    if (!rest) return false;

    const account = game.lobbyManager.getAccount(rest);
    if (!account) return false;

    game.accountDB.toggleGM(account as Account);

    emit({
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      message: `${account.username} is ${account.isTester ? 'now' : 'no longer'} a tester.`,
      from: '★System'
    });

    return true;

  }
}
