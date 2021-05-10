
import { Alignment, Allegiance, BaseClass, CharacterCurrency, FOVVisibility, LearnedSpell, SkillBlock, StatBlock } from './building-blocks';
import { ICharacterItems } from './characteritems';
import { Direction } from './direction';
import { IEffectContainer } from './effect';
import { ISimpleItem } from './item';
import { INPC } from './npc';

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
  fov: Record<number, Record<number, FOVVisibility>>;
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

  agro: Record<string, number>;
  allegianceReputation: Partial<Record<Allegiance, number>>;

  allTraits: Record<string, number>;
  learnedSpells: Record<string, LearnedSpell>;
  spellCooldowns: Record<string, number>;
  spellChannel?: { ticks: number; callback: () => void };

  pets?: INPC[];
}

