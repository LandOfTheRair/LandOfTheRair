import { GameAction } from '@lotr/interfaces';

import type { ILobbyCommand } from '../../../interfaces';

import { wsBroadcast } from '@lotr/core';
import type { IServerGame } from '@lotr/interfaces';

export class MOTDCommand implements ILobbyCommand {
  name = '/motd';
  syntax = '/motd <newmotd> (blank to reset)';

  async do(message: string, game: IServerGame) {
    const [cmd, ...rest] = message.split(' ');

    const motd = rest.join(' ') || 'Welcome to Land of the Rair!';
    game.worldDB.setMOTD(motd);

    wsBroadcast(game.messageHelper.getSystemMessageObject(motd));

    wsBroadcast({
      action: GameAction.ChatSetMOTD,
      motd,
    });

    return true;
  }
}
