import { distanceFrom } from '../../../../../../helpers';
import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class DoubleAttack extends SpellCommand {
  override aliases = ['doubleattack'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return distanceFrom(caster, target) <= this.range(caster);
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    this.game.combatHelper.physicalAttack(executor, target);
    this.game.combatHelper.physicalAttack(executor, target);
  }
}
