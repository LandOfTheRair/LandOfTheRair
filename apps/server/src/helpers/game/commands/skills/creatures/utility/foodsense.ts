import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class Foodsense extends SpellCommand {
  override aliases = ['foodsense', 'cast foodsense'];
  override requiresLearn = true;
  override spellRef = 'Foodsense';
  override canTargetSelf = true;

  override canUse(char: ICharacter, target: ICharacter) {
    return false;
  }
}
