import type { ISpawnerData } from '@lotr/interfaces';
import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

const customSpawners: Record<string, ISpawnerData> = {};
const customSpawnersByMap: Record<string, Record<string, ISpawnerData>> = {};

export function spawnerCustomAdd(
  mapName: string,
  spawnerTag: string,
  spawner: ISpawnerData,
) {
  customSpawners[spawnerTag] = spawner;

  customSpawnersByMap[mapName] ??= {};
  customSpawnersByMap[mapName][spawnerTag] = spawner;
}

export function spawnerCustomClearMap(mapName: string): void {
  Object.keys(customSpawnersByMap?.[mapName] ?? {}).forEach((spawnerTag) => {
    delete customSpawners[spawnerTag];
    delete customSpawnersByMap[mapName][spawnerTag];
  });
}

export function spawnerAllGet(): Record<string, ISpawnerData> {
  return getContentKey('spawners');
}

export function spawnerGet(spawnerTag: string): ISpawnerData | undefined {
  const ret = customSpawners[spawnerTag] || spawnerAllGet()[spawnerTag];
  if (!ret) {
    logErrorWithContext(
      `Content:Spawner:${spawnerTag}`,
      new Error(`Spawner not found: ${spawnerTag}`),
    );
  }

  return ret;
}

export function spawnerExists(itemName: string): boolean {
  return !!spawnerAllGet()[itemName] || !!customSpawners[itemName];
}
