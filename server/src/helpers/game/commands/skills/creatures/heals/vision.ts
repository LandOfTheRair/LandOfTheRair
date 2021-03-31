import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Vision extends SpellCommand {

  aliases = ['vision', 'cast vision'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'Vision';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && this.game.effectHelper.hasEffect(target, 'Blind');
  }
}
