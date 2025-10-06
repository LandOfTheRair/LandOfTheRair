import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Gemsense extends SpellCommand {
  override aliases = ['gemsense', 'cast gemsense'];
  override requiresLearn = true;
  override spellRef = 'Gemsense';
  override canTargetSelf = true;

  override canUse(char: ICharacter, target: ICharacter) {
    return false;
  }
}
