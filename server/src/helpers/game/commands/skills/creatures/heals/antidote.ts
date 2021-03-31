import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Antidote extends SpellCommand {

  aliases = ['antidote', 'cast antidote'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'Antidote';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && this.game.effectHelper.hasEffect(target, 'Poison');
  }
}
