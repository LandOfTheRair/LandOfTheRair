import type { ICharacter } from '@lotr/interfaces';
import { Skill } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class PowerBalladSong extends Spell {
  override getPotency(caster: ICharacter | null) {
    return caster
      ? this.game.characterHelper.getSkillLevel(caster, Skill.Thievery)
      : 10;
  }
}
