import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FindFamiliarGolem extends Spell {
  override getDuration(caster: ICharacter | null) {
    if (!caster) return 0;
    return Math.floor(
      this.game.characterHelper.getStat(caster, Stat.CON) * 250,
    );
  }

  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {}
}
