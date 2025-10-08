import { getStat } from '@lotr/characters';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Shadowmeld extends Spell {
  override getDuration(caster: ICharacter | undefined) {
    return caster ? getStat(caster, Stat.AGI) * 2 : 30;
  }

  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {}
}
