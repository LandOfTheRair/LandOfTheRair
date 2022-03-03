
export interface IRNGDungeonConfigFluid {
  spriteStart: number;
}

export interface IRNGDungeonConfigFloor {
  spriteStart: number;
  allowFluids?: boolean;
  fluids?: number[];
  decor: number[];
  flipLR?: boolean;
  allowTrees?: boolean;
  trees?: number[];
  placeOre?: boolean;
  placeTwigs?: boolean;
}

export interface IRNGDungeonConfigWall {
  spriteStart: number;
  allowDoors?: boolean;
  doorStart?: number;
  allowHiddenWalls?: boolean;
  allowEmptyWalls?: boolean;
}

export interface IRNGDungeonMapGenConfig {
  name: string;
  algo: 'Digger'|'Uniform'|'Cellular';
  algoArgs: any[];
  iterations?: number;
  randomize?: number;
  doors?: boolean;
  connect?: boolean;
}

export interface IRNGDungeonRoomDecorConfig {
  name: string;
  decors: Array<{ quantity: number[]; decor: number[] }>;
}

export interface IRNGDungeonNPC {
  name?: string;
  gid: number;
  props: Record<string, string|number>;
}

export interface IRNGDungeonResource {
  id: string;
}

export interface IRNGDungeonMetaConfig {
  name: string;

  mapProps: {
    map: string;
    x: number;
    y: number;
    blockEntryMessage: string;
  };

  objProps: {
    entry: {
      teleportTagRef: string;
    };

    exit: {
      teleportTagMap: string;
      teleportTag: string;
    };

    stairs: {
      teleportTagMap: string;
      teleportTag: string;
      teleportTagRef: string;
    };
  };

  npcProps: {
    validNPCs: IRNGDungeonNPC[];
    npcCounts: number[];
  };

  resourceProps: {
    numResources: number;
    validOre: IRNGDungeonResource[];
    validTrees: IRNGDungeonResource[];
  };
}

export interface IRNGDungeonConfig {
  fluids: Record<string, IRNGDungeonConfigFluid>;

  foliage: Record<string, number[]>;

  decor: Record<string, number[]>;

  floors: Record<string, IRNGDungeonConfigFloor>;

  walls: Record<string, IRNGDungeonConfigWall>;

  configs: {
    themes: Record<string, { floor: IRNGDungeonConfigFloor; wall: IRNGDungeonConfigWall }>;

    mapGen: IRNGDungeonMapGenConfig[];

    fluidGen: IRNGDungeonMapGenConfig[];

    roomDecor: IRNGDungeonRoomDecorConfig[];
  };

  dungeonConfigs: IRNGDungeonMetaConfig[];

  npcs: Record<string, IRNGDungeonNPC>;

  resources: Record<string, IRNGDungeonResource>;
}
