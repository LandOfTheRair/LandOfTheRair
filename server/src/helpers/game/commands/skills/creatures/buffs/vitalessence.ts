import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class VitalEssence extends SpellCommand {

  aliases = ['vitalessence', 'cast vitalessence'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'VitalEssence';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'VitalEssence');
  }

}
