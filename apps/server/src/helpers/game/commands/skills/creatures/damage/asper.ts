import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class Asper extends SpellCommand {
  override aliases = ['asper', 'cast asper'];
  override requiresLearn = true;
  override spellRef = 'Asper';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      caster.mp.current < caster.mp.maximum * 0.75
    );
  }
}
