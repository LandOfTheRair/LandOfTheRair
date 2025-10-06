import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Identify extends SpellCommand {
  override aliases = ['identify', 'cast identify'];
  override requiresLearn = true;
  override spellRef = 'Identify';
  override canTargetSelf = true;

  override canUse(char: ICharacter, target: ICharacter) {
    return false;
  }
}
