import { ICharacter, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Poison extends Spell {

  getDuration(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getStat(caster, Stat.WIS) : 10;
  }

  getPotency(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getStat(caster, Stat.WIS) : 3;
  }

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
