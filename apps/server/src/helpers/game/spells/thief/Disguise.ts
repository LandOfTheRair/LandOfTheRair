import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Disguise extends Spell {
  override getDuration(caster: ICharacter | null) {
    return caster
      ? this.game.characterHelper.getStat(caster, Stat.CHA) * 3
      : 30;
  }

  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {}
}
