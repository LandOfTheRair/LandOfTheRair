import { BaseClass } from './building-blocks';

export enum TrackedStatistic {
  Kills = 'kills',
  KillsLair = 'killslair',
  Deaths = 'deaths',
  Strips = 'strips',
  Steps = 'steps',
  NPCsGreeted = 'npcsgreeted',
  RepeatableQuests = 'repeatablequests',
  DailyQuests = 'dailyquests'
}

export interface ICharacterStatistics {
  statistics: Partial<Record<TrackedStatistic, number>>;
  baseClass: BaseClass;
  name: string;
  level: number;
  xp: number;
}
