import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Vision extends SpellCommand {

  override aliases = ['vision', 'cast vision'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Vision';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && this.game.effectHelper.hasEffect(target, 'Blind');
  }
}
