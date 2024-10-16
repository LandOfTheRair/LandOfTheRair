import { ILobbyCommand } from '../../../interfaces';
import { Account } from '../../../models';

import { Game } from '../../core';

export class CreateGMCommand implements ILobbyCommand {
  name = '/creategm';
  syntax = '/creategm <accountname> (account must be online)';

  async do(message: string, game: Game, emit: (args) => void) {
    const [cmd, rest] = message.split(' ');

    if (!rest) return false;

    const account = game.lobbyManager.getAccount(rest);
    if (!account) return false;

    game.accountDB.toggleGM(account as Account);

    emit(
      game.messageHelper.getSystemMessageObject(
        `${account.username} is ${account.isGameMaster ? 'now' : 'no longer'} a GM.`,
      ),
    );

    return true;
  }
}
