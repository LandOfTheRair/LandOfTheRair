import { GameServerResponse, ILobbyCommand } from '../../../interfaces';

import { Game } from '../../core';

export class AlertCommand implements ILobbyCommand {
  name = '/alert';
  syntax = '/alert <message>';

  async do(message: string, game: Game) {
    const [cmd, ...rest] = message.split(' ');

    const alertText = rest.join(' ');

    game.wsCmdHandler.broadcast(
      game.messageHelper.getSystemMessageObject(alertText),
    );

    game.wsCmdHandler.broadcast({
      type: GameServerResponse.SendAlert,
      title: 'GM Alert',
      content: alertText,
    });

    return true;
  }
}
