import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Foodsense extends SpellCommand {

  override aliases = ['foodsense', 'cast foodsense'];
  override requiresLearn = true;
  override spellRef = 'Foodsense';
  override canTargetSelf = true;

  override canUse(char: ICharacter, target: ICharacter) {
    return false;
  }

}
