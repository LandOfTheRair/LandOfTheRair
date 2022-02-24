
import { Injectable } from 'injection-js';
import { IPlayer, TrackedStatistic } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class StatisticsHelper extends BaseService {

  public init() {}

  public addStatistic(player: IPlayer, statistic: TrackedStatistic, number = 1): void {
    if (!player || !player.statistics) return;
    player.statistics.statistics[statistic] = player.statistics.statistics[statistic] || 0;
    player.statistics.statistics[statistic]! += number ?? 0;

    player.sessionStatistics.statistics[statistic] = player.sessionStatistics.statistics[statistic] || 0;
    player.sessionStatistics.statistics[statistic]! += number ?? 0;
  }

  public syncBaseStatistics(player: IPlayer): void {
    player.statistics.baseClass = player.baseClass;
    player.statistics.xp = player.exp;
    player.statistics.name = player.name;
    player.statistics.level = player.level;
    player.statistics.username = player.username;
    player.statistics.charSlot = player.charSlot;
  }

  public syncSessionStatistics(player: IPlayer): void {
    player.sessionStatistics.end = Date.now();
    player.sessionStatistics.baseClass = player.baseClass;
    player.sessionStatistics.name = player.name;
    player.sessionStatistics.level = player.level;
  }

}
