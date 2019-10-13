import { Allegiance, BaseClass, CharacterCurrency, ItemSlot, StatBlock } from './building-blocks';
import { IItem } from './item';

export interface ItemContainer {
  items: IItem[];
}

export interface CharacterItems {
  potion: IItem;

  equipment: { [key in ItemSlot]: IItem };

  sack: ItemContainer;
  belt: ItemContainer;
  pouch: ItemContainer;
}

export interface ICharacter {
  name: string;
  charSlot: number;
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
