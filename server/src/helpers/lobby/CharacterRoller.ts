import { Inject, Singleton } from 'typescript-ioc';
import { StatBlock } from '../../interfaces';
import { ContentManager } from '../data';

@Singleton
export class CharacterRoller {

  @Inject private contentManager: ContentManager;

  public async init() {}

  rollCharacter({ allegiance, baseclass }): { stats: StatBlock, gold: number } {
    // TODO: skills, equipment
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

    const { gold, ...stats } = coreStats;

    return { gold, stats };
  }
}
