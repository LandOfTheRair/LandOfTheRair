import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ImbueFrost extends SpellCommand {

  override aliases = ['imbuefrost', 'cast imbuefrost'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'ImbueFrost';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'ImbueFrost');
  }

}
