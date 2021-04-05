import { ICharacter, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Blind extends Spell {

  override getDuration(caster: ICharacter | null) {
    if (!caster) return 15;
    return Math.floor(this.game.characterHelper.getStat(caster, Stat.WIS) * 2)
         + this.game.traitHelper.traitLevelValue(caster, 'DazingOutlook');
  }

  override getPotency(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getStat(caster, Stat.WIS) : 10;
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
