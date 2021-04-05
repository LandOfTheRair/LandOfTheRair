import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Poison extends SpellCommand {

  override aliases = ['poison', 'cast poison'];
  override requiresLearn = true;
  override spellRef = 'Poison';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'Poison');
  }

}
