import { ICharacter, Skill } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class MagicMirror extends Spell {
  override getPotency(caster: ICharacter | null) {
    return caster
      ? this.game.characterHelper.getSkillLevel(caster, Skill.Conjuration) + 1
      : 10;
  }
}
