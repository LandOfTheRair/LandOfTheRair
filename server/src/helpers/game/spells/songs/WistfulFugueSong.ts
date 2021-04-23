
import { ICharacter, Skill, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class WistfulFugueSong extends Spell {

  override getDuration(caster: ICharacter | null) {
    return 600;
  }

  override getPotency(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getSkillLevel(caster, Skill.Thievery) : 10;
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
  }

}
