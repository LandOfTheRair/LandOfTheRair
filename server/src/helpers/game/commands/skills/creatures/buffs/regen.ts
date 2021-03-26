import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Regen extends SpellCommand {

  aliases = ['regen', 'cast regen'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'Regen';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Regen')
        && target.hp.current < (target.hp.maximum * 0.75);
  }

}
