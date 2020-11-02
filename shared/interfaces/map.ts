

// tiles that show as clear and forcibly overwrite FOV when on a dense tile
export enum TilesWithNoFOVUpdate {
  Empty = 0,
  Air = 2386
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
  SpawnerZones = 14
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
  EventSource = 'EventSource'
}

export interface IMapData {
  tiledJSON: any;
  layerData: { [key in MapLayer]?: any };
}

export interface IMapProperties {

  // the region this map is in - determines things like banks, regional caps, regional drops
  region: string;

  // the holiday this map requires - for holiday maps like thanksgiving
  holiday: string;

  // the max skill level you can get in this map
  maxSkill: number;

  // the max # of creatures on this map
  maxCreatures: number;

  // whether this map should spawn creatures
  disableCreatureSpawn: boolean;

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
  kickMap: string;

  // the x you get kicked to from this instance
  kickX: number;

  // the y you get kicked to from this instances
  kickY: number;

}
