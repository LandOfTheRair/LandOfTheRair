import type { IItem, ISimpleItem } from '@lotr/interfaces';
import { isUndefined } from 'lodash';
import { itemGet } from './items';

export function itemPropertyGet<T extends keyof IItem>(
  item: ISimpleItem | undefined,
  prop: T,
): IItem[T] | undefined {
  if (!item) return undefined;

  if (!isUndefined(item.mods[prop])) return item.mods[prop];

  if (item.name === 'hands' || item.name === 'feet') return undefined;

  const realItem = itemGet(item.name);
  if (!realItem) return undefined;

  return realItem[prop];
}

export function itemPropertiesGet(
  item: ISimpleItem | undefined,
  props: Array<keyof IItem>,
): Partial<IItem> {
  const hash: Partial<IItem> = {};
  props.forEach((prop) => (hash[prop] = itemPropertyGet(item, prop) as any));
  return hash;
}

export function itemPropertySet<T extends keyof IItem>(
  item: ISimpleItem,
  prop: T,
  value: IItem[T],
): void {
  item.mods[prop] = value;
}
