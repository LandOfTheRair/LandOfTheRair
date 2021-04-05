import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class DarkVision extends SpellCommand {

  override aliases = ['darkvision', 'cast darkvision'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'DarkVision';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'DarkVision');
  }

}
