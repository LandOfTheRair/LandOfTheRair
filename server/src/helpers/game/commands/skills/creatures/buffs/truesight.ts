import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class TrueSight extends SpellCommand {

  aliases = ['truesight', 'cast truesight'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'TrueSight';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'TrueSight');
  }

}
