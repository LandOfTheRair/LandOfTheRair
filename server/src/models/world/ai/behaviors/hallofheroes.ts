import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { IAIBehavior, IHallOfHeroesBehavior, INPC } from '../../../../interfaces';

export class HallOfHeroesBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IHallOfHeroesBehavior) {
    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async () => behavior.message);
  }

  tick() {}
}
