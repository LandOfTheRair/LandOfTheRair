import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class SecondWind extends SpellCommand {

  override aliases = ['secondwind', 'cast secondwind'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'SecondWind';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'SecondWind');
  }

}
