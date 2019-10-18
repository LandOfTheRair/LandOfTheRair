import { Alignment, Allegiance, BaseClass, CharacterCurrency, Direction, ItemSlot, SkillBlock, StatBlock } from './building-blocks';
import { ISimpleItem } from './item';
import { IStatusEffect } from './status-effect';

export interface ItemContainer {
  items: ISimpleItem[];
}

export interface CharacterItems {
  potion?: ISimpleItem;

  equipment: { [key in ItemSlot]?: ISimpleItem };

  sack: ItemContainer;
  belt: ItemContainer;
  pouch: ItemContainer;

  buyback: ISimpleItem[];
}

export interface ICharacter {
  uuid: string;

  name: string;
  affiliation?: string;
  allegiance: Allegiance;
  alignment: Alignment;
  baseClass: BaseClass;

  gender: 'male'|'female';
  map: string;
  x: number;
  y: number;

  level: number;

  stats: StatBlock;
  totalStats: StatBlock;
  skills: SkillBlock;

  dir: Direction;

  currency: CharacterCurrency;
  items: CharacterItems;

  effects: { [effName: string]: IStatusEffect };

  combatTicks: number;

  agro: { [uuid: string]: number };
  allegianceReputation: { [allegiance in Allegiance]?: number };
}

