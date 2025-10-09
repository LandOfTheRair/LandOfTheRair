import { getSkillLevel } from '@lotr/characters';
import type { ICharacter } from '@lotr/interfaces';
import { Skill } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class MirrorImage extends Spell {
  override getCharges(caster: ICharacter | undefined) {
    return caster ? getSkillLevel(caster, Skill.Conjuration) : 30;
  }

  override getDuration(): number {
    return 30;
  }
}
