import * as fs from 'fs-extra';
import { Map, RNG, Room } from 'rot-js/dist/rot';
import {
  IChallenge,
  IItemDefinition,
  INPCDefinition,
  IRNGDungeonConfig,
  IRNGDungeonConfigFloor,
  IRNGDungeonConfigWall,
  IRNGDungeonMapGenConfig,
  IRNGDungeonMetaConfig,
  ISpawnerData,
  MapLayer,
  MapTilesetLayer,
  Rollable,
} from '../../../interfaces';
import { RNGDungeonItemGenerator } from './ItemGenerator';
import { RNGDungeonNPCGenerator } from './NPCGenerator';
import { RNGDungeonSpawnerGenerator } from './SpawnerGenerator';
import { RNGDungeonTilemapGenerator } from './TilemapGenerator';

export enum MapGenTile {
  Empty = 0,
  Wall = 1,
  Door = 2,
  DefaultWall = 3,
}

export interface IGeneratorMapNode {
  x: number;
  y: number;
  idx: number;
  hasFluid: boolean;
  hasFoliage: boolean;
  hasWall: boolean;
  hasDecor: boolean;
  hasDenseDecor: boolean;
  hasOpaqueDecor: boolean;
}

export interface ISpoilerLog {
  isGM?: boolean;
  message: string;
}

export class MapGenerator {
  private itemGenerator: RNGDungeonItemGenerator;
  private npcGenerator: RNGDungeonNPCGenerator;
  private tilemapGenerator: RNGDungeonTilemapGenerator;
  private spawnerGenerator: RNGDungeonSpawnerGenerator;

  private readonly rng: RNG;

  private readonly genHeight = 100;
  private readonly genWidth = 100;
  private readonly gutter = 5;

  private readonly quadrants = [
    { xStart: 5, xEnd: 40, yStart: 5, yEnd: 40 }, // top left
    { xStart: 60, xEnd: 95, yStart: 5, yEnd: 40 }, // top right
    { xStart: 5, xEnd: 40, yStart: 60, yEnd: 95 }, // bottom left
    { xStart: 60, xEnd: 95, yStart: 60, yEnd: 95 }, // bottom right
  ];

  private mapConfig: IRNGDungeonMapGenConfig;
  private mapRooms: Room[] = [];
  private mapTheme: {
    floor: IRNGDungeonConfigFloor;
    wall: IRNGDungeonConfigWall;
  };

  private creatures: INPCDefinition[][] = [];
  private items: IItemDefinition[] = [];
  private mapDroptable: Rollable[] = [];
  private spawnersAndLegendaries: Array<{
    legendary?: INPCDefinition;
    spawners: ISpawnerData[];
  }> = [];

  private spoilerLog: ISpoilerLog[] = [];

  public get finalSpoilerLog(): ISpoilerLog[] {
    return this.spoilerLog;
  }

  private get width(): number {
    return this.tiledJSON.width;
  }

  constructor(
    private mapMeta: IRNGDungeonMetaConfig,
    private tiledJSON: any,
    private readonly seed: number,
    private readonly config: IRNGDungeonConfig,
    private readonly challengeData: IChallenge,
    private readonly spriteData: any,
    private readonly itemDefBases: IItemDefinition[],
  ) {
    const rng = RNG.setSeed(this.seed);

    // discard the first result just in case
    // if seeds are too close to each other, they sometimes all operate the same
    rng.getItem([]);

    this.rng = rng;
  }

  // add a message to the spoiler log
  private addSpoilerLog(message: string, isGM?: boolean): void {
    this.spoilerLog.push({ message, isGM });
  }

  // get the first gid for a particular tileset; useful for making the dungeon look coherent
  private getFirstGid(layer: MapTilesetLayer): number {
    return this.tiledJSON.tilesets[layer].firstgid;
  }

  // add a tiled object to the map somewhere
  private addTiledObject(layer: MapLayer, obj: any): void {
    const fullObj = {
      id: this.tiledJSON.nextobjectid,
      rotation: 0,
      visible: true,
      height: 64,
      width: 64,
      ...obj,
    };

    this.tiledJSON.layers[layer].objects.push(fullObj);

    this.tiledJSON.nextobjectid++;
  }

  // search and see if there's a tiled object that exists at an x/y on a layer
  private hasTiledObject(layer: MapLayer, x: number, y: number): boolean {
    return this.tiledJSON.layers[layer].objects.find(
      (obj) => obj.x === x * 64 && obj.y === (y + 1) * 64,
    );
  }

  // generate the base map (flood with 0/default (3))
  private generateEmptyMapBase(): MapGenTile[][] {
    return Array(this.genHeight + this.gutter * 2)
      .fill(MapGenTile.Empty)
      .map(() =>
        Array(this.genWidth + this.gutter * 2).fill(MapGenTile.DefaultWall),
      );
  }

  // get a tile from an array based on x/y
  private getTileAtXY(array: number[], x: number, y: number) {
    return this.tilemapGenerator.getTileAtXY(array, x, y);
  }

  // turn an index into x/y
  private getTileXYFromIndex(idx: number): { x: number; y: number } {
    return this.tilemapGenerator.getTileXYFromIndex(idx);
  }

  // get the status of every tile in the map so far
  private getArrayOfNodesForMapZone(
    startX: number,
    endX: number,
    startY: number,
    endY: number,
  ): IGeneratorMapNode[] {
    const nodes: IGeneratorMapNode[] = [];

    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        const idx = x + this.width * y;
        nodes.push({
          x,
          y,
          idx,
          hasFluid: this.tiledJSON.layers[2].data[idx] > 0,
          hasFoliage: this.tiledJSON.layers[3].data[idx] > 0,
          hasWall: this.tiledJSON.layers[4].data[idx] > 0,
          hasDecor: this.hasTiledObject(MapLayer.Decor, x, y),
          hasDenseDecor: this.hasTiledObject(MapLayer.DenseDecor, x, y),
          hasOpaqueDecor: this.hasTiledObject(MapLayer.OpaqueDecor, x, y),
        });
      }
    }

    return nodes;
  }

  // add entry spaces for portals to land on
  private addPortalEntries(possibleSpaces: IGeneratorMapNode[]): void {
    const validSpaces = possibleSpaces.filter(
      (x) =>
        !x.hasFluid &&
        !x.hasWall &&
        !x.hasFoliage &&
        !x.hasDecor &&
        !x.hasDenseDecor &&
        !x.hasOpaqueDecor,
    );

    this.quadrants.forEach(({ xStart, xEnd, yStart, yEnd }, idx) => {
      const validSpacesInZone = validSpaces.filter(
        (x) => x.x >= xStart && x.x < xEnd && x.y >= yStart && x.y < yEnd,
      );

      if (validSpacesInZone.length > 0) {
        const portal = this.rng.getItem(validSpacesInZone);
        if (!portal) {
          console.error(
            new Error(
              '[Solokar] No valid map space for portal entry ' +
                JSON.stringify({ xStart, xEnd, yStart, yEnd }),
            ),
          );
          return;
        }

        this.addTiledObject(MapLayer.Interactables, {
          name: 'Tagged Entry',
          type: 'TaggedEntry',
          gid: 1717,
          x: portal.x * 64,
          y: (portal.y + 1) * 64,
          properties: {
            teleportTagRef:
              this.mapMeta.objProps.entry.teleportTagRef + (idx + 1),
          },
        });

        this.addSpoilerLog(
          `Entry space added at ${portal.x}, ${portal.y + 1}.`,
          true,
        );
      }
    });
  }

  // add exit spaces so folks can, like, leave
  private addPortalExits(possibleSpaces: IGeneratorMapNode[]): void {
    const validSpaces = possibleSpaces.filter((tile) => {
      if (!tile.hasWall) return;

      const { x, y } = tile;

      const hasW =
        this.getTileAtXY(
          this.tiledJSON.layers[MapLayer.Walls].data,
          x - 1,
          y,
        ) !== 0;
      const hasE =
        this.getTileAtXY(
          this.tiledJSON.layers[MapLayer.Walls].data,
          x + 1,
          y,
        ) !== 0;
      const hasN =
        this.getTileAtXY(
          this.tiledJSON.layers[MapLayer.Walls].data,
          x,
          y - 1,
        ) !== 0;

      const hasNE =
        this.getTileAtXY(
          this.tiledJSON.layers[MapLayer.Walls].data,
          x + 1,
          y - 1,
        ) !== 0;
      const hasNW =
        this.getTileAtXY(
          this.tiledJSON.layers[MapLayer.Walls].data,
          x - 1,
          y - 1,
        ) !== 0;

      const noS =
        this.getTileAtXY(
          this.tiledJSON.layers[MapLayer.Walls].data,
          x,
          y + 1,
        ) === 0;

      return hasW && hasE && hasN && hasNE && hasNW && noS;
    });

    this.quadrants.forEach(({ xStart, xEnd, yStart, yEnd }, idx) => {
      const validSpacesInZone = validSpaces.filter(
        (x) => x.x >= xStart && x.x < xEnd && x.y >= yStart && x.y < yEnd,
      );

      if (validSpacesInZone.length > 0) {
        const portal = this.rng.getItem(validSpacesInZone);
        if (!portal) {
          console.error(
            new Error(
              '[Solokar] No valid map space for portal exit ' +
                JSON.stringify({ xStart, xEnd, yStart, yEnd }),
            ),
          );
          return;
        }

        const tileIdx = this.tiledJSON.layers[MapLayer.Walls].data[portal.idx];
        this.tiledJSON.layers[MapLayer.Walls].data[portal.idx] = 0;

        this.addTiledObject(MapLayer.OpaqueDecor, {
          name: 'Tagged Exit Back Wall',
          type: '',
          gid: tileIdx,
          x: portal.x * 64,
          y: (portal.y + 1) * 64,
        });

        this.addTiledObject(MapLayer.Interactables, {
          name: 'Tagged Exit',
          type: 'Teleport',
          gid: 1713,
          x: portal.x * 64,
          y: (portal.y + 1) * 64,
          properties: {
            teleportTagMap: this.mapMeta.objProps.exit.teleportTagMap,
            teleportTag: this.mapMeta.objProps.exit.teleportTag + (idx + 1),
          },
        });

        this.addSpoilerLog(
          `Exit portal added at ${portal.x}, ${portal.y + 1}.`,
          true,
        );
      }
    });
  }

  // add the only stairs out of the dungeon
  private addStairs(possibleSpaces: IGeneratorMapNode[]): void {
    this.tilemapGenerator.addStairs(possibleSpaces);
  }

  // add a door to the map at x,y
  private addDoor(x: number, y: number): void {
    if (this.hasTiledObject(MapLayer.OpaqueDecor, x, y)) return;
    if (this.hasTiledObject(MapLayer.Interactables, x, y)) return;

    const isHorizontalDoor =
      this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x - 1, y) !==
        0 &&
      this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x + 1, y) !==
        0;

    const isVerticalDoor =
      this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x, y - 1) !==
        0 &&
      this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x, y + 1) !==
        0;

    // if it doesn't have both sides, it's not door-able
    if (!isHorizontalDoor && !isVerticalDoor) return;

    // if we allow hidden walls, we randomly get a door 25% of the time, otherwise we get a door guaranteed
    const isDoor = this.mapTheme.wall.allowHiddenWalls
      ? this.rng.getItem([true, false, false, false])
      : true;

    if (isDoor) {
      const firstgid = this.getFirstGid(MapTilesetLayer.Decor);
      const tiledId =
        this.spriteData.doorStates[
          (this.mapTheme.wall.doorStart ?? 0) + (isHorizontalDoor ? 0 : 1)
        ].tiledId;

      const obj = {
        gid: firstgid + tiledId,
        name: 'Door',
        type: 'Door',
        x: x * 64,
        y: (y + 1) * 64,
      };

      this.addTiledObject(MapLayer.Interactables, obj);
    } else {
      const firstgid = this.getFirstGid(MapTilesetLayer.Walls);
      const tiledId =
        this.mapTheme.wall.spriteStart + 14 + (isHorizontalDoor ? 1 : 0);

      const obj = {
        gid: firstgid + tiledId,
        name: 'Secret Wall',
        type: 'SecretWall',
        x: x * 64,
        y: (y + 1) * 64,
      };

      this.addTiledObject(MapLayer.OpaqueDecor, obj);
    }
  }

  // place a foliage layer if possible & applicable
  private placeFoliage(): void {
    const treeSets = this.mapTheme.floor.trees;
    const treeChoices = this.rng.getItem(treeSets);

    this.tiledJSON.layers[MapLayer.Foliage].data = this.tiledJSON.layers[
      MapLayer.Foliage
    ].data.map((d, idx) => {
      if (
        this.tiledJSON.layers[MapLayer.Walls].data[idx] ||
        this.tiledJSON.layers[MapLayer.Fluids].data[idx]
      ) {
        return 0;
      }
      if (!this.rng.getItem([true, ...Array(9).fill(false)])) return 0;

      return this.rng.getItem(treeChoices) ?? 0;
    });
  }

  // attempt to place fluids; sometimes it fails, so this is called a few times when needed
  private placeFluids(): void {
    const fluidConfig = this.rng.getItem(this.config.configs.fluidGen);
    const firstGid = this.getFirstGid(MapTilesetLayer.Terrain);
    const fluidSets = this.mapTheme.floor.fluids;
    const fluidChoice = this.rng.getItem(fluidSets);

    // pick a config

    // generate a map
    const mapGenerator = new Map[fluidConfig.algo](...fluidConfig.algoArgs);

    // some maps require randomize to be set
    if (fluidConfig.randomize) {
      mapGenerator.randomize(fluidConfig.randomize);
    }

    mapGenerator.create((x, y, value) => {
      const pos = x + y * this.tiledJSON.width;

      if (fluidConfig.invert && !value) return;
      if (!fluidConfig.invert && value) return;
      if (
        this.mapTheme.wall.allowEmptyWalls &&
        this.tiledJSON.layers[MapLayer.Walls].data[pos]
      ) {
        return;
      }

      this.tiledJSON.layers[MapLayer.Fluids].data[pos] =
        firstGid + fluidChoice.spriteStart;
    });

    this.tiledJSON.layers[MapLayer.Fluids].data = this.autotileWater(
      this.tiledJSON.layers[MapLayer.Fluids].data,
    );
  }

  // place random decorative objects
  private placeRandomDecor(chances = 9): void {
    if (this.mapTheme.floor.decor.length === 0) return;

    for (let i = 0; i < this.tiledJSON.height * this.tiledJSON.width; i++) {
      if (
        this.tiledJSON.layers[MapLayer.Walls].data[i] ||
        this.tiledJSON.layers[MapLayer.Foliage].data[i] ||
        this.tiledJSON.layers[MapLayer.Fluids].data[i]
      ) {
        continue;
      }

      if (this.rng.getItem([false, ...Array(chances).fill(true)])) continue;

      const { x, y } = this.getTileXYFromIndex(i);

      if (this.hasTiledObject(MapLayer.Decor, x, y)) continue;
      if (this.hasTiledObject(MapLayer.DenseDecor, x, y)) continue;
      if (this.hasTiledObject(MapLayer.OpaqueDecor, x, y)) continue;
      if (this.hasTiledObject(MapLayer.Interactables, x, y)) continue;

      const decorSets = this.mapTheme.floor.decor.flat(Infinity);
      const decorChoice = this.rng.getItem(decorSets);

      // no gid math because we ripped these numbers directly
      const obj = {
        gid: decorChoice,
        x: x * 64,
        y: (y + 1) * 64,
      };

      this.addTiledObject(MapLayer.Decor, obj);
    }
  }

  // place decor in rooms by theme per room
  private placeRoomDecor(room: Room): void {
    if (this.mapTheme.floor.decor.length === 0) return;
    if (this.rng.getItem([true, ...Array(9).fill(false)])) return;

    const roomTypeChoice = this.rng.getItem(this.config.configs.roomDecor);

    // if custom floors are allowed, swap the tiles
    if (roomTypeChoice.allowCustomFloor) {
      const firstTileGid = this.getFirstGid(MapTilesetLayer.Terrain);

      const floor = this.rng.getItem(roomTypeChoice.customFloors);

      const push = floor.flipLR ? 1 : 0;

      // place the base tiles
      for (let x = room.getLeft(); x <= room.getRight() + push; x++) {
        for (let y = room.getTop(); y <= room.getBottom(); y++) {
          const i = x + this.gutter + this.tiledJSON.width * (y + this.gutter);

          // handle floor, place default floor
          this.tiledJSON.layers[MapLayer.Terrain].data[i] =
            firstTileGid +
            floor.spriteStart +
            this.rng.getItem([47, 47, 47, 48]) -
            1;
        }
      }

      // place the "nice" tiles

      // top row
      for (let x = room.getLeft(); x <= room.getRight() + push; x++) {
        const i =
          this.tiledJSON.width * (room.getTop() - 1 + this.gutter) +
          x +
          this.gutter;

        // handle floor, place default floor
        this.tiledJSON.layers[MapLayer.Floors].data[i] =
          firstTileGid + floor.spriteStart + (floor.flipLR ? 16 : 14);
      }

      // bottom row
      for (let x = room.getLeft(); x <= room.getRight() + push; x++) {
        const i =
          this.tiledJSON.width * (room.getBottom() + 1 + this.gutter) +
          x +
          this.gutter;

        // handle floor, place default floor
        this.tiledJSON.layers[MapLayer.Floors].data[i] =
          firstTileGid + floor.spriteStart + (floor.flipLR ? 14 : 16);
      }

      // left side
      for (let y = room.getTop(); y <= room.getBottom(); y++) {
        const i =
          room.getLeft() -
          1 +
          this.gutter +
          this.tiledJSON.width * (y + this.gutter);

        // handle floor, place default floor
        this.tiledJSON.layers[MapLayer.Floors].data[i] =
          firstTileGid + floor.spriteStart + (floor.flipLR ? 15 : 17);
      }

      // right side
      for (let y = room.getTop(); y <= room.getBottom(); y++) {
        const i =
          room.getRight() +
          (floor.flipLR ? 1 : 0) +
          1 +
          this.gutter +
          this.tiledJSON.width * (y + this.gutter);

        // handle floor, place default floor
        this.tiledJSON.layers[MapLayer.Floors].data[i] =
          firstTileGid + floor.spriteStart + (floor.flipLR ? 17 : 15);
      }

      const topWithGutter = room.getTop() - 1 + this.gutter;
      const bottomWithGutter = room.getBottom() + 1 + this.gutter;
      const roomWidth = room.getRight() - room.getLeft();

      // corners
      this.tiledJSON.layers[MapLayer.Floors].data[
        this.tiledJSON.width * topWithGutter - 1 + this.gutter + room.getLeft()
      ] = firstTileGid + floor.spriteStart + (floor.flipLR ? 3 : 30);

      this.tiledJSON.layers[MapLayer.Floors].data[
        this.tiledJSON.width * topWithGutter +
          1 +
          this.gutter +
          room.getLeft() +
          roomWidth +
          push
      ] = firstTileGid + floor.spriteStart + (floor.flipLR ? 4 : 31);

      this.tiledJSON.layers[MapLayer.Floors].data[
        this.tiledJSON.width * bottomWithGutter -
          1 +
          this.gutter +
          room.getLeft()
      ] = firstTileGid + floor.spriteStart + (floor.flipLR ? 2 : 33);

      this.tiledJSON.layers[MapLayer.Floors].data[
        this.tiledJSON.width * bottomWithGutter +
          1 +
          this.gutter +
          room.getLeft() +
          roomWidth +
          push
      ] = firstTileGid + floor.spriteStart + (floor.flipLR ? 1 : 32);
    }

    const coords: Array<{ x: number; y: number }> = [];

    for (let x = room.getLeft(); x <= room.getRight(); x++) {
      for (let y = room.getTop(); y <= room.getBottom(); y++) {
        const i = x + this.gutter + this.tiledJSON.width * (y + this.gutter);
        if (
          this.tiledJSON.layers[MapLayer.Walls].data[i] ||
          this.tiledJSON.layers[MapLayer.Foliage].data[i] ||
          this.tiledJSON.layers[MapLayer.Fluids].data[i]
        ) {
          continue;
        }

        coords.push({ x: x + this.gutter, y: y + this.gutter });
      }
    }

    roomTypeChoice.decors.forEach(({ quantity, decor }) => {
      const realQty = this.rng.getItem(quantity);

      for (let i = 0; i < realQty; i++) {
        if (coords.length === 0) break;

        const randomIdx = this.rng.getUniform() * coords.length;
        const coordObj = coords.splice(randomIdx, 1)[0];

        const { x, y } = coordObj;

        // no gid math because we ripped these numbers directly
        const obj = {
          gid: this.rng.getItem(decor),
          name: '',
          type: '',
          x: x * 64,
          y: (y + 1) * 64,
        };

        this.addTiledObject(MapLayer.Decor, obj);
      }
    });
  }

  // auto-tile the water (twice as many tiles as walls)
  private autotileWater(water: number[]): number[] {
    return this.tilemapGenerator.autotileWater(water);
  }

  // auto-tile the walls array, based on empty walls / doors
  private autotileWalls(
    walls: number[],
    doors: number[],
    allowEmptyWalls = false,
  ): number[] {
    return this.tilemapGenerator.autotileWalls(walls, doors, allowEmptyWalls);
  }

  // get a filtered version of the base map array with only specific tiles visible
  private mapArrayFiltered(
    mapArray: MapGenTile[][],
    filters: MapGenTile[],
  ): Array<1 | 0> {
    const res: Array<1 | 0> = [];

    mapArray.forEach((arr) => {
      const filtered = arr.map((x) => (filters.includes(x) ? 1 : 0));
      res.push(...filtered);
    });

    return res;
  }

  // add an object to prevent succorporting in the map globally
  private setSuccorport(): void {
    this.tilemapGenerator.setSuccorport();
  }

  // set map meta properties for exit/entry rules
  private setMapProperties(): void {
    ['gearDrop', 'kick', 'respawn'].forEach((key) => {
      this.tiledJSON.properties[key + 'Map'] = this.mapMeta.mapProps.map;
      this.tiledJSON.properties[key + 'X'] = this.mapMeta.mapProps.x;
      this.tiledJSON.properties[key + 'Y'] = this.mapMeta.mapProps.y;
    });

    this.tiledJSON.properties.respawnKick = true;
    this.tiledJSON.properties.blockEntryMessage =
      this.mapMeta.mapProps.blockEntryMessage;
    this.tiledJSON.properties.maxLevel = this.mapMeta.mapProps.maxLevel;
    this.tiledJSON.properties.maxSkill = this.mapMeta.mapProps.maxSkill;
  }

  // place green npcs on the map
  private addNPCs(possibleSpaces: IGeneratorMapNode[]): void {
    return this.tilemapGenerator.addNPCs(possibleSpaces);
  }

  // place natural resources on the map
  private addNaturalResources(possibleSpaces: IGeneratorMapNode[]): void {
    this.tilemapGenerator.addNaturalResources(possibleSpaces);
  }

  // populate the entire map
  private populateMap(baseMap: MapGenTile[][]): void {
    // rip out tile data
    const firstTileGid = this.getFirstGid(MapTilesetLayer.Terrain);
    const firstWallGid = this.getFirstGid(MapTilesetLayer.Walls);

    // handle floor, place default floor
    this.tiledJSON.layers[MapLayer.Terrain].data = this.tiledJSON.layers[
      MapLayer.Terrain
    ].data.map(
      () =>
        firstTileGid +
        this.mapTheme.floor.spriteStart +
        this.rng.getItem([47, 47, 47, 48]) -
        1,
    );

    // handle walls, auto tile
    const allWalls = this.mapArrayFiltered(baseMap, [
      MapGenTile.Wall,
      MapGenTile.DefaultWall,
    ]);
    const doors = this.mapArrayFiltered(baseMap, [MapGenTile.Door]);

    const walls = allWalls.map((val) =>
      val === 0 ? 0 : firstWallGid + this.mapTheme.wall.spriteStart,
    );
    this.tiledJSON.layers[MapLayer.Walls].data = this.autotileWalls(
      walls,
      doors,
      this.mapTheme.wall.allowEmptyWalls,
    );

    // check if we can add fluids, and fail only 1/5 of the time
    if (
      this.mapTheme.floor.allowFluids &&
      this.rng.getItem([true, ...Array(4).fill(false)])
    ) {
      let attempts = 0;
      while (
        this.tiledJSON.layers[MapLayer.Fluids].data.filter(Boolean).length ===
          0 &&
        attempts++ < 10
      ) {
        this.placeFluids();
      }

      if (attempts >= 10) {
        console.error(new Error('Failed to place fluids. 10 times. Wow?'));
      }
    }

    // if we allow trees, get them in there. no fail because thieves.
    if (this.mapTheme.floor.allowTrees) {
      this.placeFoliage();
    }

    // handle doors
    if (this.mapConfig.doors && this.mapTheme.wall.allowDoors) {
      this.mapRooms.forEach((room) => {
        room.getDoors((x, y) => {
          this.addDoor(x + this.gutter, y + this.gutter);
        });

        this.placeRoomDecor(room);
      });

      this.placeRandomDecor(99);
    } else {
      this.placeRandomDecor(19);
    }

    const possibleSpacesForPlacements = this.getArrayOfNodesForMapZone(
      this.gutter,
      this.genWidth - this.gutter,
      this.gutter,
      this.genHeight - this.gutter,
    );

    this.addPortalEntries(possibleSpacesForPlacements.slice());
    this.addPortalExits(possibleSpacesForPlacements.slice());
    this.addStairs(possibleSpacesForPlacements.slice());
    this.addNPCs(possibleSpacesForPlacements.slice());
    this.addNaturalResources(possibleSpacesForPlacements.slice());

    this.items = this.getItems();
    this.mapDroptable = this.getMapDroptable();
    this.creatures = this.getCreatures();
    this.spawnersAndLegendaries = this.getSpawners(this.creatures);

    this.placeSpawnersRandomly(
      possibleSpacesForPlacements.slice(),
      this.spawnersAndLegendaries,
    );

    this.setMapProperties();
    this.setSuccorport();
  }

  // write the map file - not strictly necessary as we can do it all in memory, but helps for debugging
  private writeMapFile(): void {
    fs.ensureDirSync('content/maps/generated');
    fs.writeJSON(
      `content/maps/generated/${this.mapMeta.name}.json`,
      this.tiledJSON,
    );
  }

  // get a list of spawners for the creatures created
  private getSpawners(
    creatures: INPCDefinition[][],
  ): Array<{ legendary?: INPCDefinition; spawners: ISpawnerData[] }> {
    return this.spawnerGenerator.getSpawners(creatures);
  }

  // place spawners randomly on the map, but somewhat grouped by type in different quadrants
  private placeSpawnersRandomly(
    validSpaces: IGeneratorMapNode[],
    spawners: Array<{ legendary?: INPCDefinition; spawners: ISpawnerData[] }>,
  ): void {
    const takenQuadrants: number[] = [];
    const quadrants = [0, 1, 2, 3];

    let allValidSpaces = validSpaces.slice();

    const filterValidSpaceNearTile = (spawnerTile) => {
      allValidSpaces = allValidSpaces.filter(
        (space) =>
          space.x < spawnerTile.x - 3 ||
          space.x > spawnerTile.x + 3 ||
          space.y < spawnerTile.y - 3 ||
          space.y > spawnerTile.y + 3,
      );
    };

    spawners.forEach((group) => {
      const quadrant = this.rng.getItem(
        quadrants.filter((q) => !takenQuadrants.includes(q)),
      );
      takenQuadrants.push(quadrant);

      const quadrant2 = this.rng.getItem(
        quadrants.filter((q) => !takenQuadrants.includes(q)),
      );
      takenQuadrants.push(quadrant2);

      let hasPlacedLegendary = false;
      takenQuadrants.forEach((quad) => {
        const quadData = this.quadrants[quad];

        const validSpacesInQuadrant = () =>
          allValidSpaces.filter(
            (space) =>
              (space.x < quadData.xStart ||
                space.x > quadData.xEnd ||
                space.y < quadData.yStart ||
                space.y > quadData.yEnd) &&
              !space.hasWall &&
              !space.hasDenseDecor &&
              !space.hasFluid,
          );

        if (!hasPlacedLegendary && group.legendary) {
          hasPlacedLegendary = true;
          const legendarySpawnerTile = this.rng.getItem(
            validSpacesInQuadrant(),
          );

          if (legendarySpawnerTile) {
            this.addTiledObject(MapLayer.Spawners, {
              gid: 2363,
              name: 'Legendary Spawner',
              x: legendarySpawnerTile.x * 64,
              y: (legendarySpawnerTile.y + 1) * 64,
              properties: {
                tag: 'Global Lair',
                lairName: group.legendary.npcId,
              },
            });

            filterValidSpaceNearTile(legendarySpawnerTile);

            this.addSpoilerLog(
              `Legendary spawner added at ${legendarySpawnerTile.x}, ${legendarySpawnerTile.y + 1}.`,
              true,
            );
          }
        }

        for (let i = 0; i < 20; i++) {
          const spawnerTile = this.rng.getItem(validSpacesInQuadrant());
          const spawner = this.rng.getItem(group.spawners);

          if (!spawnerTile || !spawner) continue;

          filterValidSpaceNearTile(spawnerTile);

          this.addTiledObject(MapLayer.Spawners, {
            gid: 2363,
            name: spawner.tag,
            x: spawnerTile.x * 64,
            y: (spawnerTile.y + 1) * 64,
            properties: {
              tag: spawner.tag,
            },
          });
        }
      });
    });
  }

  // get NPC definitions for this map
  private getCreatures(): INPCDefinition[][] {
    return this.npcGenerator.getCreatures();
  }

  // get the droptable for this map
  private getMapDroptable(): Rollable[] {
    return this.itemGenerator.getMapDroptable(
      this.items,
      this.mapMeta.droptableProps.alwaysDrop,
    );
  }

  // get all item definitions for this map
  private getItems(): IItemDefinition[] {
    return this.itemGenerator.getItems();
  }

  // create all of the various generators used for the map so this doesn't have to be a ~1600 line file
  private createGenerators() {
    this.itemGenerator = new RNGDungeonItemGenerator(
      this.rng,
      this.mapMeta,
      this.config,
      (msg) => this.addSpoilerLog(msg),
      this.itemDefBases,
    );

    this.npcGenerator = new RNGDungeonNPCGenerator(
      this.rng,
      this.mapMeta,
      this.config,
      this.challengeData,
      (msg) => this.addSpoilerLog(msg),
      this.itemDefBases,
    );

    this.tilemapGenerator = new RNGDungeonTilemapGenerator(
      this.rng,
      this.mapMeta,
      this.mapTheme,
      this.config,
      (msg, gm) => this.addSpoilerLog(msg, gm),
      (layer, obj) => this.addTiledObject(layer, obj),
      this.width,
    );

    this.spawnerGenerator = new RNGDungeonSpawnerGenerator(
      this.rng,
      this.mapMeta,
      this.config,
      (msg) => this.addSpoilerLog(msg),
    );
  }

  // generate the map! do all the things!
  public generateBaseMap(): {
    mapJSON: any;
    creatures: INPCDefinition[][];
    spawners: ISpawnerData[][];
    items: IItemDefinition[];
    mapDroptable: Rollable[];
  } {
    const baseMap = this.generateEmptyMapBase();

    // get the rng past the first value by doing a basic shuffle; otherwise it seems to always pick the first one
    const config = this.rng.getItem(this.config.configs.mapGen);

    this.mapConfig = config;

    // pick a theme
    const theme = this.rng.getItem(Object.keys(this.config.configs.themes));
    const themeData = this.config.configs.themes[theme];

    this.mapTheme = themeData;

    // create and run the map generator
    const mapGenerator = new Map[this.mapConfig.algo](
      ...this.mapConfig.algoArgs,
    );

    if (this.mapConfig.randomize) {
      mapGenerator.randomize(this.mapConfig.randomize);
    }

    const updateNode = (x: number, y: number, value: MapGenTile) => {
      baseMap[y + this.gutter][x + this.gutter] = value;
    };

    for (let i = 0; i < (this.mapConfig.iterations ?? 1); i++) {
      mapGenerator.create(
        i === (this.mapConfig.iterations ?? 1) - 1 ? updateNode : null,
      );
    }

    // get rooms if applicable
    this.mapRooms = [];
    if (this.mapConfig.doors && this.mapTheme.wall.allowDoors) {
      this.mapRooms = mapGenerator.getRooms();
      this.mapRooms.forEach((room: Room) => {
        room.getDoors((x, y) => updateNode(x, y, MapGenTile.Door));
      });
    }

    // we always connect the dungeon; we want no holes otherwise the map isn't traversible always
    if (this.mapConfig.connect) {
      mapGenerator.connect(updateNode);
    }

    this.createGenerators();
    this.populateMap(baseMap);
    this.writeMapFile();

    return {
      mapJSON: this.tiledJSON,
      creatures: this.creatures,
      spawners: this.spawnersAndLegendaries.map((x) => x.spawners),
      items: this.items,
      mapDroptable: this.mapDroptable,
    };
  }
}
