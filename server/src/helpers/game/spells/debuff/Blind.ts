import { ICharacter, ISpellData, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Blind extends Spell {

  getDuration(caster: ICharacter | null) {
    return caster ? Math.floor(this.game.characterHelper.getStat(caster, Stat.WIS) * 2) : 15;
  }

  getPotency(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getStat(caster, Stat.WIS) : 10;
  }

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
