import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Regen extends SpellCommand {

  override aliases = ['regen', 'cast regen'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'Regen';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Regen')
        && target.hp.current < (target.hp.maximum * 0.75);
  }

}
