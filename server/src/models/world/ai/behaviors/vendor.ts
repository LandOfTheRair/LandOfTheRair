import { Parser } from 'muud';
import { Game } from '../../../../helpers';
import { IAIBehavior, INPC, IVendorBehavior } from '../../../../interfaces';

export class VendorBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IVendorBehavior) {
    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        return `Hello, ${env?.player.name}!`;
      });
  }

  tick() {}
}
