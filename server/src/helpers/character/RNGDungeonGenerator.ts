
import { Injectable } from 'injection-js';
import * as fs from 'fs-extra';
import { RNG, Map, Room } from 'rot-js/dist/rot';
import { IRNGDungeonConfig, IRNGDungeonConfigFloor,
  IRNGDungeonConfigWall, IRNGDungeonMapGenConfig, IRNGDungeonMetaConfig, MapLayer, MapTilesetLayer } from '../../interfaces';

import { BaseService } from '../../models/BaseService';

enum MapGenTile {
  Empty = 0,
  Wall = 1,
  Door = 2,
  DefaultWall = 3
}

interface IGeneratorMapNode {
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

class MapGenerator {

  private readonly genHeight = 100;
  private readonly genWidth = 100;
  private readonly gutter = 5;

  private readonly quadrants = [
    { xStart: 5, xEnd: 40, yStart: 5, yEnd: 40 },   // top left
    { xStart: 60, xEnd: 95, yStart: 5, yEnd: 40 },  // top right
    { xStart: 5, xEnd: 40, yStart: 60, yEnd: 95 },  // bottom left
    { xStart: 60, xEnd: 95, yStart: 60, yEnd: 95 }  // bottom right
  ];

  private mapConfig: IRNGDungeonMapGenConfig;
  private mapRooms: Room[] = [];
  private mapTheme: { floor: IRNGDungeonConfigFloor; wall: IRNGDungeonConfigWall};

  private get width(): number {
    return this.tiledJSON.width;
  }

  constructor(
    private mapMeta: IRNGDungeonMetaConfig,
    private tiledJSON: any,
    private rng: typeof RNG,
    private readonly config: IRNGDungeonConfig,
    private readonly spriteData: any
  ) {}

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
      ...obj
    };

    this.tiledJSON.layers[layer].objects.push(fullObj);

    this.tiledJSON.nextobjectid++;
  }

  // search and see if there's a tiled object that exists at an x/y on a layer
  private hasTiledObject(layer: MapLayer, x: number, y: number): boolean {
    return this.tiledJSON.layers[layer].objects.find(obj => obj.x === x * 64 && obj.y === (y + 1) * 64);
  }

  // generate the base map (flood with 0/default (3))
  private generateEmptyMapBase(): MapGenTile[][] {
    return Array(this.genHeight + (this.gutter * 2))
      .fill(MapGenTile.Empty)
      .map(() => Array(this.genWidth + (this.gutter * 2)).fill(MapGenTile.DefaultWall));
  }

  // get a tile from an array based on x/y
  private getTileAtXY(array: number[], x: number, y: number) {
    return array[x + (this.width * y)];
  }

  // turn an index into x/y
  private getTileXYFromIndex(idx: number): { x: number; y: number } {
    const x = idx % this.width;
    const y = Math.floor(idx / this.width);

    return { x, y };
  }

  // get the status of every tile in the map so far
  private getArrayOfNodesForMapZone(startX: number, endX: number, startY: number, endY: number): IGeneratorMapNode[] {

    const nodes: IGeneratorMapNode[] = [];

    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {

        const idx = x + (this.width * y);
        nodes.push({
          x, y,
          idx,
          hasFluid: this.tiledJSON.layers[2].data[idx] > 0,
          hasFoliage: this.tiledJSON.layers[3].data[idx] > 0,
          hasWall: this.tiledJSON.layers[4].data[idx] > 0,
          hasDecor: this.hasTiledObject(MapLayer.Decor, x, y),
          hasDenseDecor: this.hasTiledObject(MapLayer.DenseDecor, x, y),
          hasOpaqueDecor: this.hasTiledObject(MapLayer.OpaqueDecor, x, y)
        });
      }
    }

    return nodes;
  }

  // add entry spaces for portals to land on
  private addPortalEntries(possibleSpaces: IGeneratorMapNode[]): void {
    const validSpaces = possibleSpaces.filter(x => !x.hasFluid
                                                && !x.hasWall
                                                && !x.hasFoliage
                                                && !x.hasDecor
                                                && !x.hasDenseDecor
                                                && !x.hasOpaqueDecor);

    this.quadrants.forEach(({ xStart, xEnd, yStart, yEnd }, idx) => {

      const validSpacesInZone = validSpaces.filter(x => x.x >= xStart && x.x < xEnd && x.y >= yStart && x.y < yEnd);

      if (validSpacesInZone.length > 0) {
        const portal = this.rng.getItem(validSpacesInZone);
        if (!portal) {
          console.error(new Error('[Solokar] No valid map space for portal entry ' + JSON.stringify({ xStart, xEnd, yStart, yEnd })));
          return;
        }

        this.addTiledObject(MapLayer.Interactables, {
          name: 'Tagged Entry',
          type: 'TaggedEntry',
          gid: 1717,
          x: portal.x * 64,
          y: (portal.y + 1) * 64,
          properties: {
            teleportTagRef: this.mapMeta.objProps.entry.teleportTagRef + (idx + 1)
          }
        });
      }
    });
  }

  // add exit spaces so folks can, like, leave
  private addPortalExits(possibleSpaces: IGeneratorMapNode[]): void {
    const validSpaces = possibleSpaces.filter(tile => {
      if (!tile.hasWall) return;

      const { x, y } = tile;

      const hasW =  this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x - 1, y) !== 0;
      const hasE =  this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x + 1, y) !== 0;
      const hasN =  this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x,     y - 1) !== 0;

      const hasNE = this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x + 1, y - 1) !== 0;
      const hasNW = this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x - 1, y - 1) !== 0;

      const noS   = this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x,     y + 1) === 0;

      return hasW && hasE && hasN && hasNE && hasNW && noS;
    });

    this.quadrants.forEach(({ xStart, xEnd, yStart, yEnd }, idx) => {

      const validSpacesInZone = validSpaces.filter(x => x.x >= xStart && x.x < xEnd && x.y >= yStart && x.y < yEnd);

      if (validSpacesInZone.length > 0) {
        const portal = this.rng.getItem(validSpacesInZone);
        if (!portal) {
          console.error(new Error('[Solokar] No valid map space for portal exit ' + JSON.stringify({ xStart, xEnd, yStart, yEnd })));
          return;
        }

        const tileIdx = this.tiledJSON.layers[MapLayer.Walls].data[portal.idx];
        this.tiledJSON.layers[MapLayer.Walls].data[portal.idx] = 0;

        this.addTiledObject(MapLayer.OpaqueDecor, {
          name: 'Tagged Exit Back Wall',
          type: '',
          gid: tileIdx,
          x: portal.x * 64,
          y: (portal.y + 1) * 64
        });

        this.addTiledObject(MapLayer.Interactables, {
          name: 'Tagged Exit',
          type: 'Teleport',
          gid: 1713,
          x: portal.x * 64,
          y: (portal.y + 1) * 64,
          properties: {
            teleportTagMap: this.mapMeta.objProps.exit.teleportTagMap,
            teleportTag: this.mapMeta.objProps.exit.teleportTag + (idx + 1)
          }
        });
      }
    });
  }

  // add the only stairs out of the dungeon
  private addStairs(possibleSpaces: IGeneratorMapNode[]): void {
    const validSpaces = possibleSpaces.filter(check => !check.hasFluid
                                                    && !check.hasWall
                                                    && !check.hasFoliage
                                                    && !check.hasDecor
                                                    && !check.hasDenseDecor
                                                    && !check.hasOpaqueDecor);

    const space = this.rng.getItem(validSpaces);
    if (!space || validSpaces.length === 0) {
      console.error(new Error('[Solokar] No valid map space for stairs.'));
      return;
    }

    const { x, y } = space;

    // stairs out = 1777
    const obj = {
      gid: 1777,
      name: 'Tagged Exit Stairs',
      type: 'StairsUp',
      x: x * 64,
      y: (y + 1) * 64,
      properties: {
        teleportTagMap: this.mapMeta.objProps.stairs.teleportTagMap,
        teleportTag: this.mapMeta.objProps.stairs.teleportTag,
        teleportTagRef: this.mapMeta.objProps.stairs.teleportTagRef
      }
    };

    this.addTiledObject(MapLayer.Interactables, obj);
  }

  // add a door to the map at x,y
  private addDoor(x: number, y: number): void {
    if (this.hasTiledObject(MapLayer.OpaqueDecor, x, y)) return;
    if (this.hasTiledObject(MapLayer.Interactables, x, y)) return;

    const isHorizontalDoor = this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x - 1, y) !== 0
                          && this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x + 1, y) !== 0;

    const isVerticalDoor   = this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x, y - 1) !== 0
                          && this.getTileAtXY(this.tiledJSON.layers[MapLayer.Walls].data, x, y + 1) !== 0;

    // if it doesn't have both sides, it's not door-able
    if (!isHorizontalDoor && !isVerticalDoor) return;

    const isDoor = this.rng.getItem([true, false, false, false]);

    if (isDoor) {
      const firstgid = this.getFirstGid(MapTilesetLayer.Decor);
      const tiledId = this.spriteData.doorStates[(this.mapTheme.wall.doorStart ?? 0) + (isHorizontalDoor ? 0 : 1)].tiledId;

      const obj = {
        gid: firstgid + tiledId,
        name: 'Door',
        type: 'Door',
        x: x * 64,
        y: (y + 1) * 64
      };

      this.addTiledObject(MapLayer.Interactables, obj);

    } else {
      const firstgid = this.getFirstGid(MapTilesetLayer.Walls);
      const tiledId = this.mapTheme.wall.spriteStart + 14 + (isHorizontalDoor ? 1 : 0);

      const obj = {
        gid: firstgid + tiledId,
        name: 'Secret Wall',
        type: 'SecretWall',
        x: x * 64,
        y: (y + 1) * 64
      };

      this.addTiledObject(MapLayer.OpaqueDecor, obj);
    }
  }

  // place a foliage layer if possible & applicable
  private placeFoliage(): void {
    const treeSets = this.mapTheme.floor.trees;
    const treeChoices = this.rng.getItem(treeSets);

    this.tiledJSON.layers[MapLayer.Foliage].data = this.tiledJSON.layers[MapLayer.Foliage].data.map((d, idx) => {
      if (this.tiledJSON.layers[MapLayer.Walls].data[idx] || this.tiledJSON.layers[MapLayer.Fluids].data[idx]) return 0;
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
      const pos = x + (y * (this.tiledJSON.width));

      if (fluidConfig.invert && !value) return;
      if (!fluidConfig.invert && value) return;
      if (this.mapTheme.wall.allowEmptyWalls && this.tiledJSON.layers[MapLayer.Walls].data[pos]) return;

      this.tiledJSON.layers[MapLayer.Fluids].data[pos] = firstGid + fluidChoice.spriteStart;
    });

    this.tiledJSON.layers[MapLayer.Fluids].data = this.autotileWater(this.tiledJSON.layers[MapLayer.Fluids].data);
  }

  // place random decorative objects
  private placeRandomDecor(chances = 9): void {
    if (this.mapTheme.floor.decor.length === 0) return;

    for (let i = 0; i < this.tiledJSON.height * this.tiledJSON.width; i++) {
      if (this.tiledJSON.layers[MapLayer.Walls].data[i]
      || this.tiledJSON.layers[MapLayer.Foliage].data[i]
      || this.tiledJSON.layers[MapLayer.Fluids].data[i]) continue;

      if (this.rng.getItem([false, ...Array(chances).fill(true)])) continue;

      const { x, y } = this.getTileXYFromIndex(i);

      if (this.hasTiledObject(MapLayer.Decor, x, y)) continue;
      if (this.hasTiledObject(MapLayer.DenseDecor, x, y)) continue;
      if (this.hasTiledObject(MapLayer.OpaqueDecor, x, y)) continue;
      if (this.hasTiledObject(MapLayer.Interactables, x, y)) continue;

      const decorSets = this.mapTheme.floor.decor;
      const decorChoice = this.rng.getItem(decorSets);

      // no gid math because we ripped these numbers directly
      const obj = {
        gid: decorChoice,
        x: x * 64,
        y: (y + 1) * 64
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

      const push = (floor.flipLR ? 1 : 0);

      // place the base tiles
      for (let x = room.getLeft(); x <= room.getRight() + push; x++) {
        for (let y = room.getTop(); y <= room.getBottom(); y++) {
          const i = (x + this.gutter) + (this.tiledJSON.width * (y + this.gutter));

          // handle floor, place default floor
          this.tiledJSON.layers[MapLayer.Terrain].data[i] = firstTileGid + floor.spriteStart + this.rng.getItem([47, 47, 47, 48]) - 1;
        }
      }

      // place the "nice" tiles

      // top row
      for (let x = room.getLeft(); x <= room.getRight() + push; x++) {
        const i = this.tiledJSON.width * (room.getTop() - 1 + this.gutter) + x + this.gutter;

        // handle floor, place default floor
        this.tiledJSON.layers[MapLayer.Floors].data[i] = firstTileGid + floor.spriteStart + (floor.flipLR ? 16 : 14);
      }

      // bottom row
      for (let x = room.getLeft(); x <= room.getRight() + push; x++) {
        const i = this.tiledJSON.width * (room.getBottom() + 1 + this.gutter) + x + this.gutter;

        // handle floor, place default floor
        this.tiledJSON.layers[MapLayer.Floors].data[i] = firstTileGid + floor.spriteStart + (floor.flipLR ? 14 : 16);
      }

      // left side
      for (let y = room.getTop(); y <= room.getBottom(); y++) {
        const i = (room.getLeft() - 1 + this.gutter) + (this.tiledJSON.width * (y + this.gutter));

        // handle floor, place default floor
        this.tiledJSON.layers[MapLayer.Floors].data[i] = firstTileGid + floor.spriteStart + (floor.flipLR ? 15 : 17);
      }

      // right side
      for (let y = room.getTop(); y <= room.getBottom(); y++) {
        const i = (room.getRight() + (floor.flipLR ? 1 : 0) + 1 + this.gutter) + (this.tiledJSON.width * (y + this.gutter));

        // handle floor, place default floor
        this.tiledJSON.layers[MapLayer.Floors].data[i] = firstTileGid + floor.spriteStart + (floor.flipLR ? 17 : 15);
      }

      const topWithGutter = room.getTop() - 1 + this.gutter;
      const bottomWithGutter = room.getBottom() + 1 + this.gutter;
      const roomWidth = room.getRight() - room.getLeft();

      // corners
      this.tiledJSON.layers[MapLayer.Floors]
        .data[this.tiledJSON.width * topWithGutter - 1 + this.gutter + room.getLeft()] = firstTileGid
                                                                                       + floor.spriteStart
                                                                                       + (floor.flipLR ? 3 : 30);

      this.tiledJSON.layers[MapLayer.Floors]
        .data[this.tiledJSON.width * topWithGutter + 1 + this.gutter + room.getLeft() + roomWidth + push] = firstTileGid
                                                                                                          + floor.spriteStart
                                                                                                          + (floor.flipLR ? 4 : 31);

      this.tiledJSON.layers[MapLayer.Floors]
        .data[this.tiledJSON.width * bottomWithGutter - 1 + this.gutter + room.getLeft()] = firstTileGid
                                                                                            + floor.spriteStart
                                                                                            + (floor.flipLR ? 2 : 33);

      this.tiledJSON.layers[MapLayer.Floors]
        .data[this.tiledJSON.width * bottomWithGutter + 1 + this.gutter + room.getLeft() + roomWidth + push] = firstTileGid
                                                                                                             + floor.spriteStart
                                                                                                             + (floor.flipLR ? 1 : 32);
    }

    const coords: Array<{ x: number; y: number }> = [];

    for (let x = room.getLeft(); x <= room.getRight(); x++) {
      for (let y = room.getTop(); y <= room.getBottom(); y++) {
        const i = (x + this.gutter) + (this.tiledJSON.width * (y + this.gutter));
        if (this.tiledJSON.layers[MapLayer.Walls].data[i]
        || this.tiledJSON.layers[MapLayer.Foliage].data[i]
        || this.tiledJSON.layers[MapLayer.Fluids].data[i]) continue;

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
          y: (y + 1) * 64
        };

        this.addTiledObject(MapLayer.Decor, obj);

      }
    });
  }

  // auto-tile the water (twice as many tiles as walls)
  private autotileWater(water: number[]): number[] {
    return water.map((value, idx) => {
      if (value === 0) return 0;

      const { x, y } = this.getTileXYFromIndex(idx);

      const fluidNW = this.getTileAtXY(water, x - 1,  y - 1)  !== 0;
      const fluidN  = this.getTileAtXY(water, x,      y - 1)  !== 0;
      const fluidNE = this.getTileAtXY(water, x + 1,  y - 1)  !== 0;
      const fluidE =  this.getTileAtXY(water, x + 1,  y)      !== 0;
      const fluidSE = this.getTileAtXY(water, x + 1,  y + 1)  !== 0;
      const fluidS  = this.getTileAtXY(water, x,      y + 1)  !== 0;
      const fluidSW = this.getTileAtXY(water, x - 1,  y + 1)  !== 0;
      const fluidW  = this.getTileAtXY(water, x - 1,  y)      !== 0;

      if (!fluidNW && fluidN && fluidNE && fluidE && fluidSE && fluidS && fluidSW && fluidW) return value + 1; // NW corner missing
      if (fluidNW && fluidN && !fluidNE && fluidE && fluidSE && fluidS && fluidSW && fluidW) return value + 2; // NE corner missing
      if (fluidNW && fluidN && fluidNE && fluidE && !fluidSE && fluidS && fluidSW && fluidW) return value + 3; // SE corner missing
      if (fluidNW && fluidN && fluidNE && fluidE && fluidSE && fluidS && !fluidSW && fluidW) return value + 4; // SW corner missing

      if (!fluidNW && fluidN && !fluidNE && fluidE && fluidSE && fluidS && fluidSW && fluidW) return value + 5;  // NE,NW corner missing
      if (fluidNW && fluidN && !fluidNE && fluidE && !fluidSE && fluidS && fluidSW && fluidW) return value + 6;  // NE,SE corner missing
      if (fluidNW && fluidN && fluidNE && fluidE && !fluidSE && fluidS && !fluidSW && fluidW) return value + 7;  // SE,SW corner missing
      if (!fluidNW && fluidN && fluidNE && fluidE && fluidSE && fluidS && !fluidSW && fluidW) return value + 8;  // SW,NW corner missing

      if (!fluidNW && fluidN && !fluidNE && fluidE && fluidSE && fluidS && !fluidSW && fluidW) return value + 9; // NW,NE,SW corner missing
      if (!fluidNW && fluidN && !fluidNE && fluidE && !fluidSE && fluidS && fluidSW && fluidW) return value + 10; // NW,NE,SE corner missing
      if (fluidNW && fluidN && !fluidNE && fluidE && !fluidSE && fluidS && !fluidSW && fluidW) return value + 11; // NE,SE,SW corner missing
      if (!fluidNW && fluidN && fluidNE && fluidE && !fluidSE && fluidS && !fluidSW && fluidW) return value + 12; // NW,SE,SW corner missing

      if (!fluidNW && fluidN && !fluidNE && fluidE && !fluidSE && fluidS && !fluidSW && fluidW) return value + 13;  // ALL corner missing

      if (!fluidN && fluidE && fluidSE && fluidS && fluidSW && fluidW) return value + 14; // N missing NE,NW unchecked
      if (fluidNW && fluidN && !fluidE && fluidS && fluidSW && fluidW) return value + 15; // E missing NE,SE unchecked
      if (fluidNW && fluidN && fluidNE && fluidE && !fluidS && fluidW) return value + 16; // S missing SE,SW unchecked
      if (fluidN && fluidNE && fluidE && fluidSE && fluidS && !fluidW) return value + 17; // W missing SW,NW unchecked

      if (!fluidNW && fluidN && fluidNE && fluidE && !fluidS && fluidW) return value + 18;  // NW,S missing SE,SW unchecked
      if (fluidNW && fluidN && !fluidNE && fluidE && !fluidS && fluidW) return value + 19;  // NE,S missing SE,SW unchecked
      if (!fluidN && fluidE && !fluidSE && fluidS && fluidSW && fluidW) return value + 20;  // SE,N missing NE,NW unchecked
      if (!fluidN && fluidE && fluidSE && fluidS && !fluidSW && fluidW) return value + 21;  // SW,N missing NE,NW unchecked

      if (!fluidNW && fluidN && !fluidE && fluidS && fluidSW && fluidW) return value + 22;  // NW,E missing NE,SE unchecked
      if (fluidN && !fluidNE && fluidE && fluidSE && fluidS && !fluidW) return value + 23;  // NE,W missing NW,SW unchecked
      if (fluidN && fluidNE && fluidE && !fluidSE && fluidS && !fluidW) return value + 24;  // SE,W missing NW,SW unchecked
      if (fluidNW && fluidN && !fluidE && fluidS && !fluidSW && fluidW) return value + 25;  // SW,E missing NE,SE unchecked

      if (!fluidN && fluidE && !fluidSE && fluidS && !fluidSW && fluidW) return value + 26; // SE,SW,N missing NW,NE unchecked
      if (!fluidNW && fluidN && !fluidE && fluidS && !fluidSW && fluidW) return value + 27; // NW,SW,E missing SE,NE unchecked
      if (!fluidNW && fluidN && !fluidNE && fluidE && !fluidS && fluidW) return value + 28; // NE,NW,S missing SE,SW unchecked
      if (fluidN && !fluidNE && fluidE && !fluidSE && fluidS && !fluidW) return value + 29; // NE,SE,W missing NW,SW unchecked

      if (!fluidN && fluidE && fluidSE && fluidS && !fluidW) return value + 30; // E,SE,S present, NE,SW,NW unchecked
      if (!fluidN && !fluidE && fluidS && fluidSW && fluidW) return value + 31; // W,SW,S present, NW,SE,NE unchecked
      if (fluidNW && fluidN && !fluidE && !fluidS && fluidW) return value + 32; // W,NW,N present, NE,SE,SW unchecked
      if (fluidN && fluidNE && fluidE && !fluidS && !fluidW) return value + 33; // E,NE,N present, NW,SE,SW unchecked

      if (!fluidN && fluidE && fluidS && !fluidW) return value + 34;  // E,S present, CORNERS unchecked
      if (!fluidN && !fluidE && fluidS && fluidW) return value + 35;  // W,S present, CORNERS unchecked
      if (fluidN && !fluidE && !fluidS && fluidW) return value + 36;  // W,N present, CORNERS unchecked
      if (fluidN && fluidE && !fluidS && !fluidW) return value + 37;  // E,N present, CORNERS unchecked

      if (!fluidN && !fluidE && fluidS && !fluidW) return value + 38; // S present, CORNERS unchecked
      if (!fluidN && !fluidE && !fluidS && fluidW) return value + 39; // W present, CORNERS unchecked
      if (fluidN && !fluidE && !fluidS && !fluidW) return value + 40; // N present, CORNERS unchecked
      if (!fluidN && fluidE && !fluidS && !fluidW) return value + 41; // E present, CORNERS unchecked

      if (fluidN && !fluidE && fluidS && !fluidW) return value + 42;  // N,S present, CORNERS unchecked
      if (!fluidN && fluidE && !fluidS && fluidW) return value + 43;  // E,W present, CORNERS unchecked

      if (!fluidNW && fluidN && fluidNE && fluidE && !fluidSE && fluidS && fluidSW && fluidW) return value + 44;  // NW,SE missing
      if (fluidNW && fluidN && !fluidNE && fluidE && fluidSE && fluidS && !fluidSW && fluidW) return value + 46;  // NE,SW missing

      if (fluidNW && fluidN && fluidNE && fluidE && fluidSE && fluidS && fluidSW && fluidW) return value + 47;  // ALL present

      return value;
    });
  }

  // auto-tile the walls array, based on empty walls / doors
  private autotileWalls(walls: number[], doors: number[], allowEmptyWalls = false): number[] {
    return walls.map((wall, idx) => {
      if (wall === 0) return 0;

      const { x, y } = this.getTileXYFromIndex(idx);

      const hasTopTile =    this.getTileAtXY(walls, x, y - 1) !== 0;
      const hasBottomTile = this.getTileAtXY(walls, x, y + 1) !== 0;
      const hasLeftTile =   this.getTileAtXY(walls, x - 1, y) !== 0;
      const hasRightTile =  this.getTileAtXY(walls, x + 1, y) !== 0;

      const hasLeftDoor = this.getTileAtXY(doors, x - 1, y) !== 0
                       && this.getTileAtXY(walls, x - 2, y) !== 0
                       && this.getTileAtXY(walls, x, y) !== 0;

      const hasRightDoor = this.getTileAtXY(doors, x + 1, y) !== 0
                        && this.getTileAtXY(walls, x + 2, y) !== 0
                        && this.getTileAtXY(walls, x, y) !== 0;

      const hasTopDoor = this.getTileAtXY(doors, x, y - 1) !== 0
                      && this.getTileAtXY(walls, x, y - 2) !== 0
                      && this.getTileAtXY(walls, x, y) !== 0;

      const hasBottomDoor = this.getTileAtXY(doors, x, y + 1) !== 0
                         && this.getTileAtXY(walls, x, y + 2) !== 0
                         && this.getTileAtXY(walls, x, y) !== 0;

      const hasTop = hasTopTile || hasTopDoor;
      const hasBottom = hasBottomTile || hasBottomDoor;
      const hasLeft = hasLeftTile || hasLeftDoor;
      const hasRight = hasRightTile || hasRightDoor;

      // "auto tiling" lol fuck you I'm doing this manually
      if (!hasTop && !hasBottom && !hasLeft && !hasRight)  return allowEmptyWalls ? wall : 0;
      if (hasTop && hasBottom && hasLeft && hasRight)      return wall + 1;
      if (!hasTop && hasBottom && hasLeft && hasRight)     return wall + 2;
      if (hasTop && hasBottom && hasLeft && !hasRight)     return wall + 3;

      if (hasTop && !hasBottom && hasLeft && hasRight)     return wall + 4;
      if (hasTop && hasBottom && !hasLeft && hasRight)     return wall + 5;
      if (!hasTop && hasBottom && !hasLeft && hasRight)    return wall + 6;
      if (!hasTop && hasBottom && hasLeft && !hasRight)    return wall + 7;

      if (hasTop && !hasBottom && hasLeft && !hasRight)    return wall + 8;
      if (hasTop && !hasBottom && !hasLeft && hasRight)    return wall + 9;
      if (!hasTop && hasBottom && !hasLeft && !hasRight)   return wall + 10;
      if (!hasTop && !hasBottom && hasLeft && !hasRight)   return wall + 11;

      if (hasTop && !hasBottom && !hasLeft && !hasRight)   return wall + 12;
      if (!hasTop && !hasBottom && !hasLeft && hasRight)   return wall + 13;
      if (hasTop && hasBottom && !hasLeft && !hasRight)    return wall + 14;
      if (!hasTop && !hasBottom && hasLeft && hasRight)    return wall + 15;

      return wall;
    });
  }

  private mapArrayFiltered(mapArray: MapGenTile[][], filters: MapGenTile[]): Array<1|0> {
    const res: Array<1|0> = [];

    mapArray.forEach(arr => {
      const filtered = arr.map(x => filters.includes(x) ? 1 : 0);
      res.push(...filtered);
    });

    return res;
  }

  // add an object to prevent succorporting in the map globally
  private setSuccorport(): void {
    this.addTiledObject(MapLayer.Succorport, {
      gid: 0,
      height: 64 * 110,
      visible: false,
      width: 64 * 110,
      x: 0,
      y: 0,
      properties: {
        restrictSuccor: true,
        restrictTeleport: true
      }
    });
  }

  // set map meta properties for exit/entry rules
  private setMapProperties(): void {
    ['gearDrop', 'kick', 'respawn'].forEach(key => {
      this.tiledJSON.properties[key + 'Map'] = this.mapMeta.mapProps.map;
      this.tiledJSON.properties[key + 'X'] = this.mapMeta.mapProps.x;
      this.tiledJSON.properties[key + 'Y'] = this.mapMeta.mapProps.y;
    });

    this.tiledJSON.properties.respawnKick = true;
    this.tiledJSON.properties.blockEntryMessage = this.mapMeta.mapProps.blockEntryMessage;
  }

  // place green npcs on the map
  private addNPCs(possibleSpaces: IGeneratorMapNode[]): void {

    const addedNPCs: string[] = [];

    const numNPCs = this.rng.getItem(this.mapMeta.npcProps.npcCounts);

    for (let i = 0; i < numNPCs; i++) {
      if (addedNPCs.length >= numNPCs.length) continue;

      const validSpaces = possibleSpaces.filter(check => !check.hasFluid
                                                      && !check.hasWall
                                                      && !check.hasFoliage
                                                      && !check.hasDecor
                                                      && !check.hasDenseDecor
                                                      && !check.hasOpaqueDecor);

      const space = this.rng.getItem(validSpaces);
      if (!space || validSpaces.length === 0) {
        console.error(new Error('[Solokar] No valid map space for NPC.'));
        continue;
      }

      const { x, y } = space;

      const npc = this.rng.getItem(this.mapMeta.npcProps.validNPCs.filter(checkNPC => !addedNPCs.includes(checkNPC.props.tag as string)));
      addedNPCs.push(npc.props.tag as string);

      const obj = {
        gid: npc.gid,
        name: npc.name,
        x: x * 64,
        y: (y + 1) * 64,
        properties: {
          ...npc.props
        }
      };

      this.addTiledObject(MapLayer.NPCs, obj);
    }
  }

  // place natural resources on the map
  private addNaturalResources(possibleSpaces: IGeneratorMapNode[]): void {
    const validResources: string[] = [];

    if (this.mapTheme.floor.placeOre) validResources.push(...this.mapMeta.resourceProps.validOre.map(x => x.id));
    if (this.mapTheme.floor.placeTwigs) validResources.push(...this.mapMeta.resourceProps.validTrees.map(x => x.id));

    if (validResources.length === 0) return;

    const numResources = this.mapMeta.resourceProps.numResources;

    for (let i = 0; i < numResources; i++) {
      const validSpaces = possibleSpaces.filter(check => !check.hasFluid
                                                      && !check.hasWall
                                                      && !check.hasFoliage
                                                      && !check.hasDecor
                                                      && !check.hasDenseDecor
                                                      && !check.hasOpaqueDecor);

      const space = this.rng.getItem(validSpaces);
      if (!space || validSpaces.length === 0) {
        console.error(new Error('[Solokar] No valid map space for resource.'));
        continue;
      }

      const { x, y } = space;

      const resource = this.rng.getItem(validResources);

      const obj = {
        gid: 2363,
        name: resource + ' Spawner',
        x: x * 64,
        y: (y + 1) * 64,
        properties: {
          resourceName: resource,
          tag: 'Global Single-resource'
        }
      };

      this.addTiledObject(MapLayer.Spawners, obj);
    }
  }

  // populate the entire map
  private populateMap(baseMap: MapGenTile[][]): void {

    // rip out tile data
    const firstTileGid = this.getFirstGid(MapTilesetLayer.Terrain);
    const firstWallGid = this.getFirstGid(MapTilesetLayer.Walls);

    // handle floor, place default floor
    this.tiledJSON.layers[MapLayer.Terrain].data = this.tiledJSON.layers[MapLayer.Terrain].data
      .map(() => firstTileGid + this.mapTheme.floor.spriteStart + this.rng.getItem([47, 47, 47, 48]) - 1);

    // handle walls, auto tile
    const allWalls = this.mapArrayFiltered(baseMap, [MapGenTile.Wall, MapGenTile.DefaultWall]);
    const doors = this.mapArrayFiltered(baseMap, [MapGenTile.Door]);

    const walls = allWalls.map((val) => val === 0 ? 0 : firstWallGid + this.mapTheme.wall.spriteStart);
    this.tiledJSON.layers[MapLayer.Walls].data = this.autotileWalls(walls, doors, this.mapTheme.wall.allowEmptyWalls);

    // check if we can add fluids, and fail only 1/5 of the time
    if (this.mapTheme.floor.allowFluids && this.rng.getItem([true, ...Array(4).fill(false)])) {
      let attempts = 0;
      while (this.tiledJSON.layers[MapLayer.Fluids].data.filter(Boolean).length === 0 && attempts++ < 10) {
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
      this.mapRooms.forEach(room => {
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
      this.gutter, this.genWidth - this.gutter, this.gutter, this.genHeight - this.gutter
    );

    this.addPortalEntries(possibleSpacesForPlacements.slice());
    this.addPortalExits(possibleSpacesForPlacements.slice());
    this.addStairs(possibleSpacesForPlacements.slice());
    this.addNPCs(possibleSpacesForPlacements.slice());
    this.addNaturalResources(possibleSpacesForPlacements.slice());

    this.setMapProperties();
    this.setSuccorport();
  }

  // write the map file - not strictly necessary as we can do it all in memory, but helps for debugging
  private writeMapFile(): void {
    fs.ensureDirSync('content/maps/generated');
    fs.writeJSON(`content/maps/generated/${this.mapMeta.name}.json`, this.tiledJSON);
  }

  public generateBaseMap(): any {
    const baseMap = this.generateEmptyMapBase();

    // get the rng past the first value by doing a basic shuffle; otherwise it seems to always pick the first one
    const config = this.rng.getItem(this.config.configs.mapGen);

    this.mapConfig = config;

    // pick a theme
    const theme = this.rng.getItem(Object.keys(this.config.configs.themes));
    const themeData = this.config.configs.themes[theme];

    this.mapTheme = themeData;

    // create and run the map generator
    const mapGenerator = new Map[this.mapConfig.algo](...this.mapConfig.algoArgs);

    if (this.mapConfig.randomize) {
      mapGenerator.randomize(this.mapConfig.randomize);
    }

    const updateNode = (x: number, y: number, value: MapGenTile) => {
      baseMap[y + this.gutter][x + this.gutter] = value;
    };

    for (let i = 0; i < (this.mapConfig.iterations ?? 1); i++) {
      mapGenerator.create(i === (this.mapConfig.iterations ?? 1) - 1 ? updateNode : null);
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

    this.populateMap(baseMap);
    this.writeMapFile();

    return this.tiledJSON;
  }
}

@Injectable()
export class RNGDungeonGenerator extends BaseService {

  public init() {}

  public generateDungeon(map: IRNGDungeonMetaConfig, seed?: number) {
    const config = this.game.contentManager.rngDungeonConfigData;

    const defaultDungeon = this.game.worldManager.getMap('RNGTemplate100');

    if (!defaultDungeon) {
      this.game.logger.error('RNGDungeonGenerator', 'Could not find default dungeon template.');
      return;
    }

    const defaultSeed = (map.name.split('').map(c => c.charCodeAt(0)).reduce((a, b) => a + b, 0) + (+this.game.dailyHelper.resetTime));
    seed ??= defaultSeed;

    this.game.logger.error('RNGDungeonGenerator', `Today's seed for ${map.name}: "${seed}"`);

    const rng = RNG.setSeed(seed);

    // discard the first result just in case
    // if seeds are too close to each other, they sometimes all operate the same
    rng.getItem([]);

    const generator = new MapGenerator(map, defaultDungeon.map.tiledJSON, rng, config, this.game.contentManager.spriteData);
    const mapJSON = generator.generateBaseMap();

    this.game.worldManager.createOrReplaceMap(map.name, mapJSON);

  }

}
