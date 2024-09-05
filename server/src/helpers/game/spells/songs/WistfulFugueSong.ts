import { ICharacter, Skill } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class WistfulFugueSong extends Spell {
  override getPotency(caster: ICharacter | null) {
    return caster
      ? this.game.characterHelper.getSkillLevel(caster, Skill.Thievery)
      : 10;
  }
}
