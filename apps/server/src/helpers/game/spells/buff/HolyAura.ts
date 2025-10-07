import { getStat } from '@lotr/characters';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class HolyAura extends Spell {
  override getCharges(caster: ICharacter | null) {
    return caster ? getStat(caster, Stat.WIS) * 100 : 10;
  }

  override getDuration(): number {
    return 30;
  }

  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {}
}
