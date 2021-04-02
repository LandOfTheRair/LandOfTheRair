import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ImbueFrost extends SpellCommand {

  aliases = ['imbuefrost', 'cast imbuefrost'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'ImbueFrost';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'ImbueFrost');
  }

}
