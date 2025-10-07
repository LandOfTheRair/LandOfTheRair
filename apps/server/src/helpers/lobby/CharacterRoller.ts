import { Injectable } from 'injection-js';

import { coreCharSelect } from '@lotr/content';
import { calculateSkillXPRequiredForLevel } from '@lotr/exp';
import type { ICharacterItems, SkillBlock, StatBlock } from '@lotr/interfaces';
import { cloneDeep } from 'lodash';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class CharacterRoller extends BaseService {
  public async init() {}

  rollCharacter({ allegiance, baseclass, weapons }): {
    skills: SkillBlock;
    stats: StatBlock;
    gold: number;
    items: Partial<ICharacterItems>;
  } {
    const charSelectData = cloneDeep(coreCharSelect());

    const coreStats = charSelectData.baseStats;

    const foundAllegiance = charSelectData.allegiances.find(
      (x) => x.name === allegiance,
    );
    const foundClass = charSelectData.classes.find((x) => x.name === baseclass);
    const foundWeapons = charSelectData.weapons.find((x) => x.name === weapons);

    Object.keys(foundAllegiance?.statMods || {}).forEach((stat) => {
      coreStats[stat] = coreStats[stat] || 0;
      coreStats[stat] += foundAllegiance.statMods[stat];
    });

    Object.keys(foundClass?.statMods || {}).forEach((stat) => {
      coreStats[stat] = coreStats[stat] || 0;
      coreStats[stat] += foundClass.statMods[stat];
    });

    const skills = {};
    Object.keys(foundWeapons?.baseSkills || {}).forEach((skill) => {
      skills[skill] = calculateSkillXPRequiredForLevel(
        foundWeapons.baseSkills[skill],
      );
    });

    const items = {};
    Object.keys(foundWeapons?.baseItems || {}).forEach((slot) => {
      items[slot] = this.game.itemCreator.getSimpleItem(
        foundWeapons.baseItems[slot],
      );
    });

    const { gold, ...stats } = coreStats;

    return { gold, stats, skills, items };
  }
}
