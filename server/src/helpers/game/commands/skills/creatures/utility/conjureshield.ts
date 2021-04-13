import { ICharacter, ItemSlot } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ConjureShield extends SpellCommand {

  override aliases = ['conjureshield', 'cast conjureshield'];
  override requiresLearn = true;
  override spellRef = 'ConjureShield';
  override canTargetSelf = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, caster) && !caster.items.equipment[ItemSlot.LeftHand];
  }

}
