import { getStat } from '@lotr/characters';
import { traitLevelValue } from '@lotr/content';
import type { ICharacter } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Daze extends Spell {
  override getDuration(caster: ICharacter | undefined) {
    if (!caster) return 15;
    return (
      Math.floor(getStat(caster, Stat.WIS) * 2) +
      traitLevelValue(caster, 'DazingOutlook')
    );
  }

  override getPotency(caster: ICharacter | undefined) {
    if (!caster) return 10;
    return (
      Math.floor(getStat(caster, Stat.WIS) * 2) +
      traitLevelValue(caster, 'DazingOutlook')
    );
  }
}
