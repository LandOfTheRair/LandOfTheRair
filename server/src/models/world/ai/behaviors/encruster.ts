import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { IAIBehavior, IEncrusterBehavior, INPC } from '../../../../interfaces';

export class EncrusterBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IEncrusterBehavior) {
    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async () => {
        return `Hello, adventurer!`;
      });
  }

  tick() {}
}
