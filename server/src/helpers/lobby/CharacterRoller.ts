
import { Injectable } from 'injection-js';

import { ICharacterItems, SkillBlock, StatBlock } from '../../interfaces';
import { BaseService } from '../../models/BaseService';
import { CalculatorHelper } from '../character';
import { ContentManager, ItemCreator } from '../data';

@Injectable()
export class CharacterRoller extends BaseService {

  constructor(
    private contentManager: ContentManager,
    private calculatorHelper: CalculatorHelper,
    private itemCreator: ItemCreator
  ) {
    super();
  }

  public async init() {}

  rollCharacter(
    { allegiance, baseclass, weapons }
  ): { skills: SkillBlock; stats: StatBlock; gold: number; items: Partial<ICharacterItems> } {
    const charSelectData = this.contentManager.charSelectData;

    const coreStats = charSelectData.baseStats;

    const foundAllegiance = charSelectData.allegiances.find(x => x.name === allegiance);
    const foundClass = charSelectData.classes.find(x => x.name === baseclass);
    const foundWeapons = charSelectData.weapons.find(x => x.name === weapons);

    Object.keys(foundAllegiance?.statMods || {}).forEach(stat => {
      coreStats[stat] = coreStats[stat] || 0;
      coreStats[stat] += foundAllegiance.statMods[stat];
    });

    Object.keys(foundClass?.statMods || {}).forEach(stat => {
      coreStats[stat] = coreStats[stat] || 0;
      coreStats[stat] += foundClass.statMods[stat];
    });

    const skills = {};
    Object.keys(foundWeapons?.baseSkills || {}).forEach(skill => {
      skills[skill] = this.calculatorHelper.calculateSkillXPRequiredForLevel(foundWeapons.baseSkills[skill]);
    });

    const items = {};
    Object.keys(foundWeapons?.baseItems || {}).forEach(slot => {
      items[slot] = this.itemCreator.getSimpleItem(foundWeapons.baseItems[slot]);
    });

    const { gold, ...stats } = coreStats;

    return { gold, stats, skills, items };
  }
}
