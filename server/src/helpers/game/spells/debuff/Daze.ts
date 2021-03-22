import { ICharacter, ISpellData, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Daze extends Spell {

  getDuration(caster: ICharacter | null) {
    return caster ? Math.floor(this.game.characterHelper.getStat(caster, Stat.WIS) * 2) : 15;
  }

  getPotency(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getStat(caster, Stat.WIS) : 10;
  }

  public getUnformattedTooltipDesc(caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData): string {
    return 'Dazed. Failing spellcasts %potency% of the time.';
  }

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
