import { ICharacter, ItemSlot } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ConjureSword extends SpellCommand {

  override aliases = ['conjuresword', 'cast conjuresword'];
  override requiresLearn = true;
  override spellRef = 'ConjureSword';
  override canTargetSelf = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, caster)
        && (!caster.items.equipment[ItemSlot.LeftHand] || !caster.items.equipment[ItemSlot.RightHand]);
  }

}
