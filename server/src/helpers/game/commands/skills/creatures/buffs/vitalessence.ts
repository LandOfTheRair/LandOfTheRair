import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class VitalEssence extends SpellCommand {

  override aliases = ['vitalessence', 'cast vitalessence'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'VitalEssence';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'VitalEssence');
  }

}
