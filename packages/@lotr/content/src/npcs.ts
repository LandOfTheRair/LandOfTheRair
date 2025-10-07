import { INPCDefinition } from '@lotr/interfaces';
import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

const customNPCs: Record<string, INPCDefinition> = {};
const customNPCsByMap: Record<string, Record<string, INPCDefinition>> = {};

export function npcCustomAdd(mapName: string, npc: INPCDefinition) {
  customNPCs[npc.npcId] = npc;

  customNPCsByMap[mapName] ??= {};
  customNPCsByMap[mapName][npc.npcId] = npc;
}

export function npcCustomClearMap(mapName: string): void {
  Object.keys(customNPCsByMap?.[mapName] ?? {}).forEach((npcId) => {
    delete customNPCs[npcId];
    delete customNPCsByMap[mapName][npcId];
  });
}

export function npcAllGet(): Record<string, INPCDefinition> {
  return getContentKey('npcs');
}

export function npcGet(npcId: string): INPCDefinition | undefined {
  const ret = customNPCs[npcId] || npcAllGet()[npcId];
  if (!ret) {
    logErrorWithContext(
      `Content:NPC:${npcId}`,
      new Error(`NPC not found: ${npcId}`),
    );
  }

  return ret;
}

export function npcExists(itemName: string): boolean {
  return !!npcAllGet()[itemName] || !!customNPCs[itemName];
}
