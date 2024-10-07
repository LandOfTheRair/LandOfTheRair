import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import {
  distanceFrom,
  IAIBehavior,
  INPC,
  IUpgraderBehavior,
} from '../../../../interfaces';

export class GuildClerkBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IUpgraderBehavior) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        return 'Hello!';
      });
  }

  tick() {}
}
