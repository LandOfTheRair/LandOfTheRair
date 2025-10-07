import { IItemDefinition } from '@lotr/interfaces';
import { cloneDeep } from 'lodash';
import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

const customItems: Record<string, IItemDefinition> = {};
const customItemsByMap: Record<string, Record<string, IItemDefinition>> = {};

export function itemCustomAdd(mapName: string, item: IItemDefinition) {
  customItems[item.name] = item;

  customItemsByMap[mapName] ??= {};
  customItemsByMap[mapName][item.name] = item;
}

export function itemCustomClearMap(mapName: string): void {
  Object.keys(customItemsByMap?.[mapName] ?? {}).forEach((itemName) => {
    delete customItems[itemName];
    delete customItemsByMap[mapName][itemName];
  });
}

export function itemAllGet(): Record<string, IItemDefinition> {
  return getContentKey('items');
}

export function itemGet(itemName: string): IItemDefinition | undefined {
  const ret = customItems[itemName] || itemAllGet()[itemName];
  if (!ret) {
    logErrorWithContext(
      `Content:Item:${itemName}`,
      new Error(`Item not found: ${itemName}`),
    );
  }

  return ret;
}

export function itemExists(itemName: string): boolean {
  return !!itemAllGet()[itemName] || !!customItems[itemName];
}

export function itemGetMatchingName(mapName: string): IItemDefinition[] {
  const items = itemAllGet();

  return Object.values(items)
    .filter((item) => item.name.includes(mapName))
    .map((x) => cloneDeep(x));
}
