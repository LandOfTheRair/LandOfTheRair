import { Rollable } from './building-blocks';

export interface ISerializableSpawner {
  x: number;
  y: number;
  name: string;
  currentTick: number;
}

export interface ISpawnerData {
  npcIds: Rollable[] | string[];
  tag: string;
  respawnRate: number;
  initialSpawn: number;
  maxSpawn: number;
  spawnRadius: number;
  randomWalkRadius: number;
  leashRadius: number;
  shouldSerialize: boolean;
  alwaysSpawn: boolean;
  requireDeadToRespawn: boolean;
  canSlowDown: boolean;
  doInitialSpawnImmediately: boolean;
  eliteTickCap: number;
  npcAISettings: string[];

  x: number;
  y: number;
  name: string;
  currentTick: number;
  respectKnowledge: boolean;
}
