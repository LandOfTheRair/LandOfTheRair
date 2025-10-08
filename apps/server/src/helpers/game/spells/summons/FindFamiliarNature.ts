import { getStat } from '@lotr/characters';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FindFamiliarNature extends Spell {
  override getDuration(caster: ICharacter | undefined) {
    if (!caster) return 0;
    return Math.floor(getStat(caster, Stat.WIS) * 250);
  }

  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {}
}
