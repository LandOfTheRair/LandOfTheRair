import { Parser } from 'muud';
import { Game } from '../../../../helpers';
import { IAIBehavior, ITrainerBehavior } from '../../../../interfaces';

export class TrainerBehavior implements IAIBehavior {

  init(game: Game, parser: Parser, behavior: ITrainerBehavior) {
    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        return `Hello, ${env?.player.name}!`;
      });
  }

  tick() {}
}
