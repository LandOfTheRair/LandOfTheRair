import { Injectable } from 'injection-js';
import { BaseService } from '../../interfaces';

@Injectable()
export class ConfigManager extends BaseService {

  private maxLevel = 50;
  private maxSkillLevel = 30;
  private maxStats = 25;

  private maxExp = 0;
  private maxSkillExp = 0;

  public get MAX_LEVEL() {
    return this.maxLevel;
  }

  public get MAX_SKILL_LEVEL() {
    return this.maxSkillLevel;
  }

  public get MAX_STATS() {
    return this.maxStats;
  }

  public get MAX_EXP() {
    return this.maxExp;
  }

  public get MAX_SKILL_EXP() {
    return this.maxSkillExp;
  }

  async init() {
    this.maxExp = this.game.calculatorHelper.calculateXPRequiredForLevel(this.MAX_LEVEL);
    this.maxSkillExp = this.game.calculatorHelper.calculateSkillXPRequiredForLevel(this.MAX_SKILL_LEVEL);
  }
}
