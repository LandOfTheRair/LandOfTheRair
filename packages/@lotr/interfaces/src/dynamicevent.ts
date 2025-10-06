import { Stat } from './building-blocks';

export enum DynamicEventRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Legendary = 'legendary',
}

export interface IDynamicEvent {
  name: string;
  description: string;
  endsAt: number;
  eventData?: IDynamicEventMeta;
  eventRef?: string;
  statBoost?: Partial<Record<Stat, number>>;
  extraData?: any;
}

export enum DynamicEventSuccessType {
  Kills = 'kills',
}

export interface IDynamicEventMetaMetrics {
  count: number;
  type: DynamicEventSuccessType;
  killNPCs: string[];
}

export interface IDynamicEventMeta {
  name: string;
  duration: number;
  cooldown: number;
  rarity: DynamicEventRarity;
  conflicts?: string[];
  description: string;
  startMessage: string;
  endMessage: string;
  map?: string;
  npc?: string;
  extraData?: any;

  requiresPreviousEvent?: boolean;
  spawnEventOnFailure?: string;
  spawnEventOnSuccess?: string;

  successMetrics: IDynamicEventMetaMetrics;
}
