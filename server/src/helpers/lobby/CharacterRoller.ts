
import { Injectable } from 'injection-js';

import { BaseService, CharacterItems, SkillBlock, StatBlock } from '../../interfaces';
import { CalculatorHelper, ItemHelper } from '../character';
import { ContentManager } from '../data';

@Injectable()
export class CharacterRoller extends BaseService {

  constructor(
    private contentManager: ContentManager,
    private calculatorHelper: CalculatorHelper,
    private itemHelper: ItemHelper
  ) {
    super();
  }

  public async init() {}

  rollCharacter({ allegiance, baseclass }): { skills: SkillBlock, stats: StatBlock, gold: number, items: Partial<CharacterItems> } {
    const charSelectData = this.contentManager.charSelectData;

    const coreStats = charSelectData.baseStats;

    const foundAllegiance = charSelectData.allegiances.find(x => x.name === allegiance);
    const foundClass = charSelectData.classes.find(x => x.name === baseclass);

    Object.keys(foundAllegiance.statMods).forEach(stat => {
      coreStats[stat] = coreStats[stat] || 0;
      coreStats[stat] += foundAllegiance.statMods[stat];
    });

    Object.keys(foundClass.statMods).forEach(stat => {
      coreStats[stat] = coreStats[stat] || 0;
      coreStats[stat] += foundClass.statMods[stat];
    });

    const skills = {};
    Object.keys(foundAllegiance.baseSkills).forEach(skill => {
      skills[skill] = this.calculatorHelper.calculateSkillXPRequiredForLevel(foundAllegiance.baseSkills[skill]);
    });

    const items = {};
    Object.keys(foundAllegiance.baseItems).forEach(slot => {
      items[slot] = this.itemHelper.getSimpleItem(foundAllegiance.baseItems[slot]);
    });

    const { gold, ...stats } = coreStats;

    return { gold, stats, skills, items };
  }
}
