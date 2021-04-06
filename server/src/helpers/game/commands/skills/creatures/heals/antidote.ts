import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Antidote extends SpellCommand {

  override aliases = ['antidote', 'cast antidote'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Antidote';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && (this.game.effectHelper.hasEffect(target, 'Poison') || this.game.effectHelper.hasEffect(target, 'Disease'));
  }
}
