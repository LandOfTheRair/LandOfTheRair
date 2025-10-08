import { getStat } from '@lotr/characters';
import { traitLevelValue } from '@lotr/content';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Stun extends Spell {
  override getDuration(caster: ICharacter | undefined) {
    if (!caster) return 3;
    return (
      Math.floor(getStat(caster, Stat.WIS) / 2) +
      traitLevelValue(caster, 'IrresistibleStun')
    );
  }

  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {}
}
