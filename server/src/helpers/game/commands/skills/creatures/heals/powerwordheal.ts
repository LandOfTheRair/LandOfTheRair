import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class PowerwordHeal extends SpellCommand {

  aliases = ['powerword heal'];
  requiresLearn = true;
  canTargetSelf = true;
  spellDataRef = 'PowerwordHeal';
  spellRef = 'Cure';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return false;
  }
}
