import type { IPlayer, ISimpleItem } from '@lotr/interfaces';
import { DateTime } from 'luxon';
import { settingGameGet } from './settings';

export function dailyResetTime(): DateTime {
  const dailyResetHour = settingGameGet('timers', 'dailyResetHour') ?? 12;
  let theoreticalResetTime = DateTime.fromObject({
    zone: 'utc',
    hour: dailyResetHour,
  });
  if (+theoreticalResetTime < +DateTime.fromObject({ zone: 'utc' })) {
    theoreticalResetTime = theoreticalResetTime.plus({ days: 1 });
  }

  return theoreticalResetTime;
}

export function dailyCanActivateQuest(checkTimestamp: number): boolean {
  const dailyResetHour = settingGameGet('timers', 'dailyResetHour') ?? 12;
  let theoreticalResetTime = DateTime.fromObject({
    zone: 'utc',
    hour: dailyResetHour,
  });
  if (+theoreticalResetTime > +DateTime.fromObject({ zone: 'utc' })) {
    theoreticalResetTime = theoreticalResetTime.minus({ days: 1 });
  }

  return checkTimestamp < +theoreticalResetTime;
}

export function dailyItemIsDaily(item: ISimpleItem): boolean {
  return item.uuid?.includes('daily');
}

export function dailyItemCanBuy(player: IPlayer, item: ISimpleItem): boolean {
  if (!dailyItemIsDaily(item)) {
    throw new Error(
      'Attempting to buy item as a daily item ' + JSON.stringify(item),
    );
  }

  if (!player.dailyItems[item.uuid]) return true;
  if (dailyCanActivateQuest(player.dailyItems[item.uuid] ?? 0)) return true;

  return false;
}

export function dailyQuestCanDo(
  player: IPlayer,
  questGiverName: string,
): boolean {
  player.quests.npcDailyQuests = player.quests.npcDailyQuests || {};
  if (!player.quests.npcDailyQuests[questGiverName]) return true;
  if (dailyCanActivateQuest(player.quests.npcDailyQuests[questGiverName])) {
    return true;
  }

  return false;
}

export function dailyItemBuy(player: IPlayer, item: ISimpleItem) {
  player.dailyItems = player.dailyItems || {};
  player.dailyItems[item.uuid] = +DateTime.fromObject({ zone: 'utc' });
}

export function dailyQuestFinish(player: IPlayer, questGiverName: string) {
  player.quests.npcDailyQuests = player.quests.npcDailyQuests || {};
  player.quests.npcDailyQuests[questGiverName] = +DateTime.fromObject({
    zone: 'utc',
  });
}
