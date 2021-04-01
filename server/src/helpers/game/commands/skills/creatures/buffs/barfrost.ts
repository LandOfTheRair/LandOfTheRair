import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class BarFrost extends SpellCommand {

  aliases = ['barfrost', 'cast barfrost'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'BarFrost';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'BarFrost');
  }

}
