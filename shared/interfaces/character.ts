import { Allegiance, BaseClass, CharacterCurrency, ItemSlot, StatBlock } from './building-blocks';
import { ISimpleItem } from './item';

export interface ItemContainer {
  items: ISimpleItem[];
}

export interface CharacterItems {
  potion: ISimpleItem;

  equipment: { [key in ItemSlot]: ISimpleItem };

  sack: ItemContainer;
  belt: ItemContainer;
  pouch: ItemContainer;
}

export interface ICharacter {
  name: string;
  allegiance: Allegiance;
  baseClass: BaseClass;

  gender: 'male'|'female';
  map: string;
  x: number;
  y: number;

  stats: StatBlock;

  currency: CharacterCurrency;
  items: CharacterItems;
}

