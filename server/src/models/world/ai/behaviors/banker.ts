import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { IAIBehavior, IBankerBehavior, INPC } from '../../../../interfaces';

export class BankerBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IBankerBehavior) {
    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async () => {
        return `Hello, adventurer!`;
      });
  }

  tick() {}
}
