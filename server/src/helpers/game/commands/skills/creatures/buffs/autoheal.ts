import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Autoheal extends SpellCommand {

  override aliases = ['autoheal', 'cast autoheal'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Autoheal';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return caster === target
        && super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Autoheal');
  }

}
