import { GameAction, ILobbyCommand } from '../../../interfaces';

import { Game } from '../../core';

export class MOTDCommand implements ILobbyCommand {
  name = '/motd';
  syntax = '/motd <newmotd> (blank to reset)';

  async do(message: string, game: Game) {
    const [cmd, ...rest] = message.split(' ');

    const motd = rest.join(' ') || 'Welcome to Land of the Rair!';
    game.worldDB.setMOTD(motd);

    game.wsCmdHandler.broadcast(
      game.messageHelper.getSystemMessageObject(motd),
    );

    game.wsCmdHandler.broadcast({
      action: GameAction.ChatSetMOTD,
      motd,
    });

    return true;
  }
}
