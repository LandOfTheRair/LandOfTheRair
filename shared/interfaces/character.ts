
import { Alignment, Allegiance, BaseClass, CharacterCurrency, Direction, ItemSlot, SkillBlock, StatBlock } from './building-blocks';
import { ISimpleItem } from './item';
import { IStatusEffect } from './status-effect';

export interface IItemContainer {
  items: ISimpleItem[];
}

export enum SwimLevel {
  SpringWater = 1,
  NormalWater = 2,
  ChillWater = 6,
  Lava = 8
}

export interface ICharacterItems {
  equipment: { [key in ItemSlot]?: ISimpleItem };

  sack: IItemContainer;
  belt: IItemContainer;
  pouch: IItemContainer;

  buyback: ISimpleItem[];
}

export interface BoundedNumber {
  maximum: number;
  minimum: number;
  __current: number;
}

export interface ICharacter {
  uuid: string;

  name: string;
  affiliation?: string;
  allegiance: Allegiance;
  alignment: Alignment;
  baseClass: BaseClass;

  hp: BoundedNumber;
  mp: BoundedNumber;

  gender: 'male'|'female';
  fov: any;
  map: string;
  x: number;
  y: number;

  level: number;

  stats: StatBlock;
  totalStats: StatBlock;
  skills: SkillBlock;

  dir: Direction;

  currency: CharacterCurrency;
  items: ICharacterItems;

  effects: { [effName: string]: IStatusEffect };

  combatTicks: number;

  agro: { [uuid: string]: number };
  allegianceReputation: { [allegiance in Allegiance]?: number };
}

