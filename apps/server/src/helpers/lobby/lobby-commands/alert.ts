import { GameServerResponse } from '@lotr/interfaces';

import type { ILobbyCommand } from '../../../interfaces';

import { wsBroadcast } from '@lotr/core';
import type { Game } from '../../core';

export class AlertCommand implements ILobbyCommand {
  name = '/alert';
  syntax = '/alert <message>';

  async do(message: string, game: Game) {
    const [cmd, ...rest] = message.split(' ');

    const alertText = rest.join(' ');

    wsBroadcast(game.messageHelper.getSystemMessageObject(alertText));

    wsBroadcast({
      type: GameServerResponse.SendAlert,
      title: 'GM Alert',
      content: alertText,
    });

    return true;
  }
}
