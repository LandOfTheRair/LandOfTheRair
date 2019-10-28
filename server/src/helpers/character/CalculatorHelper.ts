import { Singleton } from 'typescript-ioc';

import { BaseService, ICharacter, Skill } from '../../interfaces';

const FIRST_LEVEL_CONSTANT_CHANGER = 19;
const SKILL_COEFFICIENT = 1.55;

@Singleton
export class CalculatorHelper extends BaseService {

  public init() {}

  public calculateXPRequiredForLevel(level: number): number {
    const pre20XP = Math.pow(2, Math.min(FIRST_LEVEL_CONSTANT_CHANGER, level - 1)) * 1000;

    if (level <= FIRST_LEVEL_CONSTANT_CHANGER) {
      return pre20XP;
    }

    if (level <= 50) {
      return pre20XP * (Math.max(1, level - FIRST_LEVEL_CONSTANT_CHANGER));
    }

    const level50XP = pre20XP * (Math.max(1, 50 - FIRST_LEVEL_CONSTANT_CHANGER));

    if (level === 51) return Math.floor(level50XP * 1.5);
    if (level === 52) return Math.floor(level50XP * 3);
    if (level === 53) return Math.floor(level50XP * 5);
    if (level === 54) return Math.floor(level50XP * 7.5);
    if (level === 55) return Math.floor(level50XP * 10.5);

    return 99999999999999999999999 * level;
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
