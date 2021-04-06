
import { ICharacter, Skill, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FindFamiliarLight extends Spell {

  override getDuration(caster: ICharacter | null) {
    if (!caster) return 0;
    return Math.floor(this.game.characterHelper.getStat(caster, Stat.WIS) * 250);
  }

  override getPotency(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getSkillLevel(caster, Skill.Restoration) : 10;
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
