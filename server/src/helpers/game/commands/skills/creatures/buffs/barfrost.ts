import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class BarFrost extends SpellCommand {

  override aliases = ['barfrost', 'cast barfrost'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'BarFrost';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'BarFrost');
  }

}
