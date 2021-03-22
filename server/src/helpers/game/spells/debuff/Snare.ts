import { ICharacter, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Snare extends Spell {

  getDuration(caster: ICharacter | null) {
    return caster ? Math.floor(this.game.characterHelper.getStat(caster, Stat.WIS) / 2) : 3;
  }

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
