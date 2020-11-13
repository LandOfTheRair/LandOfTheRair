import { ISimpleItem } from './item';
import { ItemClass } from './itemtypes';

export interface IGroundItem {
  item: ISimpleItem;
  count: number;
  expiresAt: number;
}

export type IGround = Record<number, Record<number, Record<ItemClass, IGroundItem[]>>>;
