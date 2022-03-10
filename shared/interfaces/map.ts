import { ICharacter } from './character';


// tiles that show as clear and forcibly overwrite FOV when on a dense tile
export enum TilesWithNoFOVUpdate {
  Empty = 0,
  Air = 2386
}

export enum MapTilesetLayer {
  Terrain = 0,
  Walls = 1,
  Decor = 2,
  Creatures = 3
}

// layers for the map, in order
export enum MapLayer {
  Terrain = 0,
  Floors = 1,
  Fluids = 2,
  Foliage = 3,
  Walls = 4,
  Decor = 5,
  DenseDecor = 6,
  OpaqueDecor = 7,
  Interactables = 8,
  NPCs = 9,
  Spawners = 10,
  RegionDescriptions = 11,
  BackgroundMusic = 12,
  Succorport = 13,
  SpawnerZones = 14,
  ZLevel = 15
}

// types of interactables and other objects present on a map
export enum ObjectType {
  Door = 'Door',
  SecretWall = 'SecretWall',
  Locker = 'Locker',
  StairsUp = 'StairsUp',
  StairsDown = 'StairsDown',
  ClimbUp = 'ClimbUp',
  ClimbDown = 'ClimbDown',
  Fall = 'Fall',
  Teleport = 'Teleport',
  Fillable = 'Fillable',
  EventSource = 'EventSource',
  TreasureChest = 'TreasureChest'
}

export interface IMapData {
  tiledJSON: any;
  layerData: Partial<Record<MapLayer, any>>;
}

export interface IMapProperties {

  // the region this map is in - determines things like banks, regional caps, regional drops
  region: string;

  // the holiday this map requires - for holiday maps like thanksgiving
  holiday?: string;

  // the max skill level you can get in this map
  maxSkill: number;

  // the max level you can reach in this map
  maxLevel: number;

  // the max # of creatures on this map
  maxCreatures: number;

  // whether this map should respawn creatures
  disableCreatureRespawn: boolean;

  // how many hours it takes items to expire on this map by default (owned items only)
  itemExpirationHours: number;

  // how often GC runs on this map (in minutes)
  itemGarbageCollection: number;

  // the maximum number of items on the ground
  maxItemsOnGround: number;

  // the map you respawn on (typically, it is the same map, but instances respawn you elsewhere)
  respawnMap: string;

  // the X you respawn at
  respawnX: number;

  // the Y you respawn at
  respawnY: number;

  // whether the map is subscriber only or not
  subscriberOnly: boolean;

  // the script this map runs (useful for map triggers like in the maze or mines)
  script: string;

  // the map you get kicked to from this instance
  kickMap?: string;

  // the x you get kicked to from this instance
  kickX?: number;

  // the y you get kicked to from this instances
  kickY?: number;

  // the map your gear gets bopped to if you die/get stripped
  gearDropMap?: string;

  // the x your gear goes to for the above map
  gearDropX?: number;

  // the y your gear goes to for the above map
  gearDropY?: number;

  // whether or not the map should send you to a specific respawn point regardless of dungeon status
  respawnKick?: boolean;

  // whether or not the map should block entry
  blockEntry?: boolean;

  // the message you recieve when trying to enter the map while entry is blocked
  blockEntryMessage?: string;
}

export interface IMapScript {
  name: string;

  setup: (game, map, mapState) => void;
  events: (game, map, mapState) => void;
  handleEvent: (game, event: string, { trigger }: { trigger: ICharacter }) => void;
}
