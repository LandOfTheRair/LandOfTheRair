
import { GameAction, ILobbyCommand } from '../../../interfaces';
import { Account } from '../../../models';

import { Game } from '../../core';

export class CreateTesterCommand implements ILobbyCommand {
  name = '/createtester';
  syntax = '/createtester <accountname> (account must be online)';

  do(message: string, game: Game, emit: (args) => void) {
    const [cmd, rest] = message.split(' ');

    if (!rest) return false;

    const account = game.lobbyManager.getAccount(rest);
    if (!account) return false;

    game.accountDB.toggleTester(account as Account);

    emit({
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      message: `${account.username} is ${account.isTester ? 'now' : 'no longer'} a tester.`,
      from: '★System'
    });

    return true;

  }
}
