import { achievementGet } from '@lotr/content';
import type { IPlayer, TrackedStatistic } from '@lotr/interfaces';
import { sumBy } from 'lodash';

export function addStatistic(
  player: IPlayer,
  statistic: TrackedStatistic,
  number = 1,
): void {
  if (!player || !player.statistics) return;
  player.statistics.statistics[statistic] =
    player.statistics.statistics[statistic] || 0;
  player.statistics.statistics[statistic]! += number ?? 0;

  player.sessionStatistics.statistics[statistic] =
    player.sessionStatistics.statistics[statistic] || 0;
  player.sessionStatistics.statistics[statistic]! += number ?? 0;
}

function syncOtherStatistics(player: IPlayer): void {
  player.statistics.statistics.achievementsearned = Object.keys(
    player.achievements.achievements,
  ).length;

  player.statistics.statistics.achievementpoints = sumBy(
    Object.keys(player.achievements.achievements),
    (a) => achievementGet(a)?.ap ?? 0,
  );
}

export function syncBaseStatistics(player: IPlayer): void {
  player.statistics.baseClass = player.baseClass;
  player.statistics.xp = player.exp;
  player.statistics.name = player.name;
  player.statistics.level = player.level;
  player.statistics.username = player.username;
  player.statistics.charSlot = player.charSlot;

  syncOtherStatistics(player);

  console.log(player.statistics);
}

export function syncSessionStatistics(player: IPlayer): void {
  player.sessionStatistics.end = Date.now();
  player.sessionStatistics.baseClass = player.baseClass;
  player.sessionStatistics.name = player.name;
  player.sessionStatistics.level = player.level;
}
