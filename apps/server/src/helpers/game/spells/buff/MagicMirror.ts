import { getSkillLevel } from '@lotr/characters';
import type { ICharacter } from '@lotr/interfaces';
import { Skill } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class MagicMirror extends Spell {
  override getPotency(caster: ICharacter | null) {
    return caster ? getSkillLevel(caster, Skill.Conjuration) + 1 : 10;
  }
}
