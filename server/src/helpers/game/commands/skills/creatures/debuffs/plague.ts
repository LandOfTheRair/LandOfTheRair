import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Plague extends SpellCommand {

  override aliases = ['plague', 'cast plague'];
  override requiresLearn = true;
  override spellRef = 'Plague';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'Plague');
  }

}
