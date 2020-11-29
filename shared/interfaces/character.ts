
import { Alignment, Allegiance, BaseClass, CharacterCurrency, Direction, LearnedSpell, SkillBlock, StatBlock } from './building-blocks';
import { ICharacterItems } from './characteritems';
import { IEffectContainer } from './effect';
import { ISimpleItem } from './item';

export interface IItemContainer {
  items: ISimpleItem[];
}

export enum SwimLevel {
  SpringWater = 1,
  NormalWater = 2,
  ChillWater = 6,
  Lava = 8
}

export interface BoundedNumber {
  maximum: number;
  minimum: number;
  current: number;
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

  effects: IEffectContainer;

  combatTicks: number;

  agro: { [uuid: string]: number };
  allegianceReputation: { [allegiance in Allegiance]?: number };

  allTraits: Record<string, number>;
  learnedSpells: { [spellName: string]: LearnedSpell };
  spellCooldowns: Record<string, number>;
  spellChannel?: { ticks: number, callback: () => void };
}

