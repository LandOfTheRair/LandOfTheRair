
import { Injectable } from 'injection-js';

import { calculateXPRequiredForLevel } from '../../../../shared/functions';
import { BaseService, ICharacter, Skill } from '../../interfaces';

const SKILL_COEFFICIENT = 1.55;

@Injectable()
export class CalculatorHelper extends BaseService {

  public init() {}

  public calculateXPRequiredForLevel(level: number): number {
    return calculateXPRequiredForLevel(level);
  }

  // skill XP needed for a particular skill level
  public calculateSkillXPRequiredForLevel(level: number): number {
    if (level === 0) return 100;

    return Math.floor(Math.pow(SKILL_COEFFICIENT, level) * 100);
  }

  // skill level for a certain skill for a character
  public calcSkillLevelForCharacter(character: ICharacter, skill: Skill) {
    const skillValue = character.skills[skill] ?? 0;
    if (skillValue < 100) return 0;

    const value = Math.log(skillValue / 100) / Math.log(SKILL_COEFFICIENT);
    return 1 + Math.floor(value);
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
