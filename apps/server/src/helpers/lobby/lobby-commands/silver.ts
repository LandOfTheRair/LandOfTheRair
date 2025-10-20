import { lobbyGetAccount } from '@lotr/core';
import type { ILobbyCommand } from '../../../interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IServerGame } from '@lotr/interfaces';

export class GiveSilverCommand implements ILobbyCommand {
  name = '/silver';
  syntax = '/silver <silver> <accountname> (account must be online)';

  async do(message: string, game: IServerGame, emit: (args) => void) {
    const [cmd, silver, rest] = message.split(' ');

    if (!rest) return false;

    const account = lobbyGetAccount(rest);
    if (!account) return false;

    game.subscriptionHelper.modifyAccountSilver(account, +silver);

    emit(
      game.messageHelper.getSystemMessageObject(
        `${account.username} was given ${silver} silver.`,
      ),
    );

    return true;
  }
}
