import { GameServerResponse } from '@lotr/interfaces';

import type { ILobbyCommand } from '../../../interfaces';

import { wsBroadcast } from '@lotr/core';
import type { IServerGame } from '@lotr/interfaces';

export class AlertCommand implements ILobbyCommand {
  name = '/alert';
  syntax = '/alert <message>';

  async do(message: string, game: IServerGame) {
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
