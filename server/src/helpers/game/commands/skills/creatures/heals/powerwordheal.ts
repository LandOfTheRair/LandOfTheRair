import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class PowerwordHeal extends SpellCommand {

  override aliases = ['powerword heal'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellDataRef = 'PowerwordHeal';
  override spellRef = 'Cure';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return false;
  }
}
