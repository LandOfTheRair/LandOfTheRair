
import { GameAction, ILobbyCommand } from '../../../interfaces';
import { Account } from '../../../models';

import { Game } from '../../core';

export class KickCommand implements ILobbyCommand {
  name = '/kick';
  syntax = '/kick <accountname> (account must be online)';

  do(message: string, game: Game, emit: (args) => void) {
    const [cmd, rest] = message.split(' ');

    if (!rest) return false;

    const account = game.lobbyManager.getAccount(rest);
    if (!account) return false;

    game.lobbyManager.accountLeaveGame(account as Account);

    game.wsCmdHandler.broadcast({
      action: GameAction.ChatUserLeaveGame,
      username: account.username
    });

    game.wsCmdHandler.sendToSocket(account.username, {
      action: GameAction.GameQuit
    });

    emit({
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      message: `${account.username} was kicked from game.`,
      from: '★System'
    });

    return true;

  }
}
