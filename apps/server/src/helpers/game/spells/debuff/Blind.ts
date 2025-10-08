import { getStat } from '@lotr/characters';
import { traitLevelValue } from '@lotr/content';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Blind extends Spell {
  override getDuration(caster: ICharacter | undefined) {
    if (!caster) return 15;
    return (
      Math.floor(getStat(caster, Stat.WIS)) +
      traitLevelValue(caster, 'DazingOutlook')
    );
  }

  override getPotency(caster: ICharacter | undefined) {
    return caster ? getStat(caster, Stat.WIS) : 10;
  }

  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {}
}
