import { BaseClass } from './building-blocks';

export enum TrackedStatistic {
  Kills = 'kills',
  KillsLair = 'killslair',
  Deaths = 'deaths',
  Strips = 'strips',
  Steps = 'steps',
  NPCsGreeted = 'npcsgreeted',
  RepeatableQuests = 'repeatablequests',
  DailyQuests = 'dailyquests',
  AlchemyCrafts = 'alchemycrafts',
  MetalworkingCrafts = 'metalworkingcrafts',
  SpellforgingCrafts = 'spellforgingcrafts'
}

export interface ICharacterStatistics {
  statistics: Partial<Record<TrackedStatistic, number>>;
  baseClass: BaseClass;
  name: string;
  level: number;
  xp: number;
  charSlot: number;
  username: string;
}

export interface ISessionStatistics {
  start: number;
  end: number;
  baseClass: string;
  name: string;
  level: number;
  statistics: Partial<Record<TrackedStatistic, number>>;
}
