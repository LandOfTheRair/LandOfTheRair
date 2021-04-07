import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ImbueEnergy extends SpellCommand {

  override aliases = ['imbueenergy', 'cast imbueenergy'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'ImbueEnergy';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !target.effects.outgoing.length;
  }

}
