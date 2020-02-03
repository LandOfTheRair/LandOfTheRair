

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
