import { ICharacter, ISpellData, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Shield extends Spell {

  override getDuration(caster: ICharacter | null) {
    return caster ? 5 + (this.game.characterHelper.getStat(caster, Stat.STR) * 100) : 600;
  }

  public override getUnformattedTooltipDesc(caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData): string {
    return 'Resisting %potency magical and physical damage.';
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
