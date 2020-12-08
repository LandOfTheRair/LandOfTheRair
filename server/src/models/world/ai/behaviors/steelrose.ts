import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { IAIBehavior, INPC, ISteelroseBehavior } from '../../../../interfaces';

export class SteelroseBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: ISteelroseBehavior) {
    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async () => {
        return `Hello, adventurer!`;
      });
  }

  tick() {}
}
