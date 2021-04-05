import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Revive extends SpellCommand {

  override aliases = ['revive', 'cast revive'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'Revive';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return false;
  }
}
