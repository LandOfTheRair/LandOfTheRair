import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Pounce extends SpellCommand {
  override aliases = ['pounce'];
  override requiresLearn = true;

  override canUse(): boolean {
    return true;
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    this.game.movementHelper.moveTowards(executor, target);
    this.game.combatHelper.physicalAttack(executor, target);
  }
}
