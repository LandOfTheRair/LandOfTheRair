import { ICharacter, ISpellData, Skill, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class MagicMirror extends Spell {

  override getDuration(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getStat(caster, Stat.INT) * 50 : 600;
  }

  override getPotency(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getSkillLevel(caster, Skill.Conjuration) + 1 : 10;
  }

  public override getUnformattedTooltipDesc(caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData): string {
    return 'Reflecting magic %potency% of the time.';
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
