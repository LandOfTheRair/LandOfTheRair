import { Rollable } from './building-blocks';

export interface ISerializableSpawner {
  x: number;
  y: number;
  name: string;
  currentTick: number;
  areCreaturesDangerous: boolean;
}

export interface ISpawnerData {
  npcIds: Rollable[] | string[];
  tag: string;
  respawnRate: number;
  initialSpawn: number;
  maxCreatures: number;
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
  isDangerous?: boolean;

  x: number;
  y: number;
  name: string;
  currentTick: number;
  respectKnowledge: boolean;
}
