import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Debilitate extends Spell {

  override getDuration(caster: ICharacter | null) {
    return caster ? 15 : 5;
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
