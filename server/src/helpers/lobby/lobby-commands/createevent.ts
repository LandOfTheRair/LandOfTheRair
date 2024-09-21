import { ILobbyCommand } from '../../../interfaces';

import { Game } from '../../core';

export class CreateEventCommand implements ILobbyCommand {
  name = '/createevent';
  syntax =
    '/createevent <name="Test Event" duration=30 statBoost.skillBonusPercent=10 statBoost.xpBonusPercent=10> (duration is minutes)';

  async do(message: string, game: Game) {
    const rest = message.substring(message.split(' ')[0].length + 1);

    if (!rest) return false;

    const formattedArgs = game.messageHelper.getMergeObjectFromArgs(rest);

    if (!formattedArgs.name) return false;
    if (!formattedArgs.duration) return false;
    if (!formattedArgs.description) {
      formattedArgs.description = 'A GM-started festival!';
    }

    formattedArgs.endsAt = Date.now() + formattedArgs.duration * 1000 * 60;
    delete formattedArgs.duration;

    game.dynamicEventHelper.startEvent(formattedArgs);

    return true;
  }
}
