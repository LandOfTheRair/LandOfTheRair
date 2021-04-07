import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ImbueFlame extends SpellCommand {

  override aliases = ['imbueflame', 'cast imbueflame'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'ImbueFlame';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !target.effects.outgoing.length;
  }

}
