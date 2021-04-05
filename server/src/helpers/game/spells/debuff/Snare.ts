import { ICharacter, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Snare extends Spell {

  getPotency(caster: ICharacter | null) {
    if (!caster) return 2;
    return this.game.traitHelper.traitLevelValue(caster, 'Roots') ? 4 : 2;
  }

  getDuration(caster: ICharacter | null) {
    return caster ? Math.floor(this.game.characterHelper.getStat(caster, Stat.WIS) / 2) : 3;
  }

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
