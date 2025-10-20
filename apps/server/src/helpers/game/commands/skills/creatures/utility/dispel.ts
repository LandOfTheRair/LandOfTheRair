import { SpellCommand } from '@lotr/core';
import { dispellableEffects } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class Dispel extends SpellCommand {
  override aliases = ['dispel', 'cast dispel'];
  override requiresLearn = true;
  override spellRef = 'Dispel';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return dispellableEffects(target).length > 0;
  }
}
