import { ICharacter, ISpellData, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Daze extends Spell {

  getDuration(caster: ICharacter | null) {
    if (!caster) return 15;
    return Math.floor(this.game.characterHelper.getStat(caster, Stat.WIS) * 2)
         + this.game.traitHelper.traitLevelValue(caster, 'DazingOutlook');
  }

  getPotency(caster: ICharacter | null) {
    if (!caster) return 10;
    return Math.floor(this.game.characterHelper.getStat(caster, Stat.WIS) * 2)
         + this.game.traitHelper.traitLevelValue(caster, 'DazingOutlook');
  }

  public getUnformattedTooltipDesc(caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData): string {
    return 'Dazed. Failing spellcasts %potency% of the time.';
  }

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
