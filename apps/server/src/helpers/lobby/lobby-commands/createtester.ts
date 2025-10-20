import { lobbyGetAccount } from '@lotr/core';
import type { ILobbyCommand } from '../../../interfaces';
import type { Account } from '../../../models';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IServerGame } from '@lotr/interfaces';

export class CreateTesterCommand implements ILobbyCommand {
  name = '/createtester';
  syntax = '/createtester <accountname> (account must be online)';

  async do(message: string, game: IServerGame, emit: (args) => void) {
    const [cmd, rest] = message.split(' ');

    if (!rest) return false;

    const account = lobbyGetAccount(rest);
    if (!account) return false;

    game.accountDB.toggleTester(account as Account);

    emit(
      game.messageHelper.getSystemMessageObject(
        `${account.username} is ${account.isTester ? 'now' : 'no longer'} a tester.`,
      ),
    );

    return true;
  }
}
