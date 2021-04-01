import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Revive extends SpellCommand {

  aliases = ['revive', 'cast revive'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'Revive';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return false;
  }
}
