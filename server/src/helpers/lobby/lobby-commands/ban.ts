import { ILobbyCommand } from '../../../interfaces';
import { Account } from '../../../models';

import { Game } from '../../core';

export class BanCommand implements ILobbyCommand {
  name = '/ban';
  syntax = '/ban <accountname> (account must be online)';

  async do(message: string, game: Game, emit: (args) => void) {
    const [cmd, rest] = message.split(' ');

    if (!rest) return false;

    const account = game.lobbyManager.getAccount(rest);
    if (!account) return false;

    game.accountDB.ban(account as Account);

    emit(
      game.messageHelper.getSystemMessageObject(
        `${account.username} is banned.`,
      ),
    );

    return true;
  }
}
