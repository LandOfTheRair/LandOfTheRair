import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Cleanse extends SpellCommand {
  override aliases = ['cleanse', 'cast cleanse'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Cleanse';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return false;
  }
}
