import type { ICharacter } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Snare extends Spell {
  override getPotency(caster: ICharacter | null) {
    if (!caster) return 2;
    return this.game.traitHelper.traitLevelValue(caster, 'Roots') ? 4 : 2;
  }
}
