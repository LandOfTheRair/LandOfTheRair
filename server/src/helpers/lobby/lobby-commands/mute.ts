
import { GameAction, ILobbyCommand } from '../../../interfaces';
import { Account } from '../../../models';

import { Game } from '../../core';

export class MuteCommand implements ILobbyCommand {
  name = '/mute';
  syntax = '/mute <accountname> (account must be online)';

  do(message: string, game: Game, emit: (args) => void) {
    const [cmd, rest] = message.split(' ');

    if (!rest) return false;

    const account = game.lobbyManager.getAccount(rest);
    if (!account) return false;

    game.accountDB.toggleMute(account as Account);

    emit({
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      message: `${account.username} is ${account.isMuted ? 'now' : 'no longer'} muted.`,
      from: '★System'
    });

    return true;

  }
}
