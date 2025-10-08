import { traitLevelValue } from '@lotr/content';
import type { ICharacter } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Snare extends Spell {
  override getPotency(caster: ICharacter | undefined) {
    if (!caster) return 2;
    return traitLevelValue(caster, 'Roots') ? 4 : 2;
  }
}
