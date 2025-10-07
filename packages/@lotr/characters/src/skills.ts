import { calcSkillLevelForCharacter } from '@lotr/exp';
import type { ICharacter, Skill, Stat } from '@lotr/interfaces';
import { getStat } from './stats';

// get the skill level for the character
export function getSkillLevel(character: ICharacter, skill: Skill) {
  return (
    calcSkillLevelForCharacter(character, skill) +
    getStat(character, `${skill.toLowerCase()}Bonus` as Stat)
  );
}
