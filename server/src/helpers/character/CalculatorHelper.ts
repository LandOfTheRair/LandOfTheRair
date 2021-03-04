
import { Injectable } from 'injection-js';
import { DateTime } from 'luxon';

import { calculateSkillLevelFromXP, calculateSkillXPRequiredForLevel,
  calculateXPRequiredForLevel, ICharacter, IPlayer, Skill } from '../../interfaces';
import { BaseService } from '../../models/BaseService';


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
  public calcSkillLevelForCharacter(character: ICharacter, skill: Skill): number {
    if (!skill) {
      this.game.logger.error('SkillCalc', new Error('Trying to calculate skill of undefined'));
      return 0;
    }

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

  // get the "seed" for players daily quests
  public getDailyOffset(player: IPlayer): number {
    return player.name.charCodeAt(0);
  }

  // get the day of year
  public getCurrentDailyDayOfYear(player: IPlayer): number {

    const now = DateTime.fromObject({ zone: 'utc' });
    const start = DateTime.fromObject({ zone: 'utc', year: now.year, month: 1, day: 1 });
    const diff = +now - +start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);

    return day + this.getDailyOffset(player);
  }
}
