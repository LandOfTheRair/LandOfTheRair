import { Injectable } from 'injection-js';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class ConfigManager extends BaseService {

  private maxLevel = 50;
  private maxSkill = 30;
  private maxStats = 25;
  private potionStats = {};

  private maxExp = 0;
  private maxSkillExp = 0;

  public get MAX_LEVEL() {
    return this.maxLevel;
  }

  public get MAX_SKILL_LEVEL() {
    return this.maxSkill;
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

  public get MAX_POTION_STAT() {
    return this.potionStats;
  }

  async init() {
    this.maxLevel = this.game.contentManager.getGameSetting('character', 'maxLevel');
    this.maxSkill = this.game.contentManager.getGameSetting('character', 'maxSkill');
    this.maxStats = this.game.contentManager.getGameSetting('character', 'maxStats');
    this.potionStats = this.game.contentManager.getGameSetting('potion');

    this.maxExp = this.game.calculatorHelper.calculateXPRequiredForLevel(this.MAX_LEVEL);
    this.maxSkillExp = this.game.calculatorHelper.calculateSkillXPRequiredForLevel(this.MAX_SKILL_LEVEL);
  }
}
