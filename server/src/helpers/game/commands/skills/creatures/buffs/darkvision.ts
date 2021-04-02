import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class DarkVision extends SpellCommand {

  aliases = ['darkvision', 'cast darkvision'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'DarkVision';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'DarkVision');
  }

}
