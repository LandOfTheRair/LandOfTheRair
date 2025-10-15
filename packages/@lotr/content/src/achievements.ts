import {
  calcSkillLevelForCharacter,
  calcTradeskillLevelForCharacter,
} from '@lotr/exp';
import type { IAchievement, IPlayer } from '@lotr/interfaces';
import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

let npcIdHash: Record<string, IAchievement> = {};
let itemHash: Record<string, IAchievement> = {};

export function achievementAll() {
  return getContentKey('achievements');
}

export function achievementsLoadForGame() {
  npcIdHash = {};
  itemHash = {};

  Object.values(achievementAll()).forEach((ach) => {
    if (ach.requirements.kill.npc) {
      npcIdHash[ach.requirements.kill.npc] = ach;
    }

    if (ach.requirements.bindItem.item) {
      itemHash[ach.requirements.bindItem.item] = ach;
    }
  });
}

export function achievementGet(name: string) {
  const allAchievements = achievementAll();
  const ret = allAchievements[name];
  if (!ret) {
    logErrorWithContext(
      `Content:Achievement:${name}`,
      new Error(`Achievement ${name} does not exist.`),
    );
  }

  return ret;
}

export function achievementExists(name: string): boolean {
  return !!achievementAll()[name];
}

export function achievementGetRelatedNPC(
  npcId: string,
): IAchievement | undefined {
  return npcIdHash[npcId];
}

export function achievementGetRelatedItem(
  itemId: string,
): IAchievement | undefined {
  return itemHash[itemId];
}

export function achievementHasEarned(
  player: IPlayer,
  achievement: IAchievement,
): boolean {
  if (achievement.requirements.level.level) {
    return (
      player.baseClass === achievement.requirements.level.baseClass &&
      player.level >= achievement.requirements.level.level
    );
  }

  if (achievement.requirements.skill.skill) {
    const curLevel = calcSkillLevelForCharacter(
      player,
      achievement.requirements.skill.skill,
    );

    return curLevel >= achievement.requirements.skill.level;
  }

  if (achievement.requirements.tradeskill.tradeskill) {
    const curLevel = calcTradeskillLevelForCharacter(
      player,
      achievement.requirements.tradeskill.tradeskill,
    );

    return curLevel >= achievement.requirements.tradeskill.level;
  }

  return false;
}

export function achievementHas(player: IPlayer, achievement: string): boolean {
  return !!player.achievements.achievements[achievement];
}

export function achievementUnearn(player: IPlayer, achievement: string) {
  delete player.achievements.achievements[achievement];
}
