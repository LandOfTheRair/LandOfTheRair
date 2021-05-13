import { Stat } from './building-blocks';

export enum DynamicEventRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Legendary = 'legendary'
}

export interface IDynamicEvent {
  name: string;
  description: string;
  endsAt: number;
  eventData?: IDynamicEventData;
  eventRef?: string;
  statBoost?: Partial<Record<Stat, number>>;
  extraData?: any;
}

export interface IDynamicEventData {
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
}
