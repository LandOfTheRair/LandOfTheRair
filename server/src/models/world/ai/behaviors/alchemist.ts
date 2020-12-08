import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { IAIBehavior, IAlchemistBehavior, INPC } from '../../../../interfaces';

export class AlchemistBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IAlchemistBehavior) {
    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async () => {
        return `Hello, adventurer!`;
      });
  }

  tick() {}
}
