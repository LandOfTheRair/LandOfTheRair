import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Debilitate extends Spell {
  override getDuration(caster: ICharacter | undefined) {
    return caster ? 15 : 5;
  }

  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {}
}
