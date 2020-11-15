
import { Injectable } from 'injection-js';

import { BaseService, calculateSkillLevelFromXP, calculateSkillXPRequiredForLevel,
  calculateXPRequiredForLevel, ICharacter, Skill } from '../../interfaces';


@Injectable()
export class CalculatorHelper extends BaseService {

  public init() {}

  public calculateXPRequiredForLevel(level: number): number {
    return calculateXPRequiredForLevel(level);
  }

  // skill XP needed for a particular skill level
  public calculateSkillXPRequiredForLevel(level: number): number {
    return calculateSkillXPRequiredForLevel(level);
  }

  // skill level for a certain skill for a character
  public calcSkillLevelForCharacter(character: ICharacter, skill: Skill) {
    const skillValue = character.skills[skill.toLowerCase()] ?? 0;
    return calculateSkillLevelFromXP(skillValue);
  }

  // get the % of current skill to next skill
  public assessPercentToNextSkill(character: ICharacter, skill: Skill): string {
    const skillValue = character.skills[skill] ?? 0;
    const skillLevel = this.calcSkillLevelForCharacter(character, skill);

    const nextLevel = skillLevel === 0 ? 100 : this.calculateSkillXPRequiredForLevel(skillLevel);
    const prevLevel = skillLevel === 0 ? 0 : this.calculateSkillXPRequiredForLevel(skillLevel - 1);

    const normalizedCurrent = skillValue - prevLevel;
    const normalizedMax = nextLevel - prevLevel;

    const percentWay = Math.max(0, (normalizedCurrent / normalizedMax * 100)).toFixed(3);

    return percentWay;
  }
}
