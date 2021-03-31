import { ICharacter, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class VitalEssence extends Spell {

  getCharges(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getStat(caster, Stat.WIS) * 100 : 10;
  }

  getDuration() {
    return -1;
  }

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
