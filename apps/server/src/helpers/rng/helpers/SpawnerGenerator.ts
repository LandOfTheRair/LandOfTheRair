import type {
  INPCDefinition,
  IRNGDungeonConfig,
  IRNGDungeonMetaConfig,
  ISpawnerData,
} from '@lotr/interfaces';
import type { RNG } from 'rot-js/dist/rot';

export class RNGDungeonSpawnerGenerator {
  constructor(
    private readonly rng: RNG,
    private readonly mapMeta: IRNGDungeonMetaConfig,
    private readonly config: IRNGDungeonConfig,
    private readonly addSpoilerLog: (message: string) => void,
  ) {}

  defaultSpawner(): ISpawnerData {
    return {
      npcIds: [],
      respawnRate: 15,
      initialSpawn: 3,
      maxCreatures: 15,
      spawnRadius: 2,
      randomWalkRadius: 20,
      leashRadius: 30,
      respectKnowledge: true,
      doInitialSpawnImmediately: true,
      shouldSerialize: false,
      alwaysSpawn: false,
      eliteTickCap: this.mapMeta.creatureProps.eliteTickCap,
      requireDeadToRespawn: false,
      canSlowDown: true,
      npcAISettings: ['default'],
      name: '',
      tag: '',
      currentTick: 0,
      x: 0,
      y: 0,
    };
  }

  getSpawners(
    creatures: INPCDefinition[][],
  ): Array<{ legendary?: INPCDefinition; spawners: ISpawnerData[] }> {
    return creatures.map((creatureGroup) => {
      const nonLegendary = creatureGroup.filter(
        (creature) =>
          creature.level !== this.mapMeta.creatureProps.legendaryLevel,
      );

      const legendary = creatureGroup.find(
        (creature) =>
          creature.level === this.mapMeta.creatureProps.legendaryLevel,
      );

      const groupSpawner = {
        ...this.defaultSpawner(),
        npcIds: nonLegendary.map((creature) => ({
          result: creature.npcId,
          chance: 1,
        })),
        tag: `${this.mapMeta.name} ${creatureGroup[0].monsterGroup} Spawner`,
      };

      const otherSpawners = nonLegendary.map((creature) => ({
        ...this.defaultSpawner(),
        npcIds: [{ result: creature.npcId, chance: 1 }],
        tag: `${creature.npcId} Spawner`,
      }));

      return { legendary, spawners: [groupSpawner, ...otherSpawners] };
    });
  }
}
