import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { IAIBehavior, INPC, ISmithBehavior } from '../../../../interfaces';

export class SmithBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: ISmithBehavior) {
    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async () => {
        return `Hello, adventurer!`;
      });
  }

  tick() {}
}
