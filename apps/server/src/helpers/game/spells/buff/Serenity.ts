import { getSkillLevel } from '@lotr/characters';
import type { ICharacter } from '@lotr/interfaces';
import { Skill } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Serenity extends Spell {
  override getCharges(caster: ICharacter | undefined) {
    return caster
      ? Math.floor(getSkillLevel(caster, Skill.Restoration) / 3)
      : 5;
  }

  override getDuration(): number {
    return 60;
  }
}
