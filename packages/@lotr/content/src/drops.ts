import type { Rollable } from '@lotr/interfaces';
import { getContentKey } from './allcontent';

const customRegionDrops: Record<string, { drops: Rollable[] }> = {};
const customMapDrops: Record<string, { drops: Rollable[] }> = {};

export function droptableCustomRegionAdd(region: string, drops: Rollable[]) {
  customRegionDrops[region] = { drops };
}

export function droptableCustomMapAdd(mapName: string, drops: Rollable[]) {
  customMapDrops[mapName] = { drops };
}

export function droptableRegionGet(region: string): { drops: Rollable[] } {
  const regionDroptable = getContentKey('regionDroptables');
  return customRegionDrops[region] || regionDroptable[region] || { drops: [] };
}

export function droptableMapGet(mapName: string): { drops: Rollable[] } {
  const mapDroptable = getContentKey('mapDroptables');
  return customMapDrops[mapName] || mapDroptable[mapName] || { drops: [] };
}
