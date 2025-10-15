import type {
  IGeneratorMapNode,
  IRNGDungeonConfig,
  IRNGDungeonConfigFloor,
  IRNGDungeonConfigWall,
  IRNGDungeonMetaConfig,
} from '@lotr/interfaces';
import { MapLayer } from '@lotr/interfaces';
import type { RNG } from 'rot-js';

export class RNGDungeonTilemapGenerator {
  constructor(
    private readonly rng: typeof RNG,
    private readonly mapMeta: IRNGDungeonMetaConfig,
    private readonly mapTheme: {
      floor: IRNGDungeonConfigFloor;
      wall: IRNGDungeonConfigWall;
    },
    private readonly config: IRNGDungeonConfig,
    private readonly addSpoilerLog: (message: string, isGM?: boolean) => void,
    private readonly addTiledObject: (layer: MapLayer, obj: any) => void,
    private readonly width: number,
  ) {}

  getTileAtXY(array: number[], x: number, y: number) {
    return array[x + this.width * y];
  }

  getTileXYFromIndex(idx: number): { x: number; y: number } {
    const x = idx % this.width;
    const y = Math.floor(idx / this.width);

    return { x, y };
  }

  autotileWalls(
    walls: number[],
    doors: number[],
    allowEmptyWalls = false,
  ): number[] {
    return walls.map((wall, idx) => {
      if (wall === 0) return 0;

      const { x, y } = this.getTileXYFromIndex(idx);

      const hasTopTile = this.getTileAtXY(walls, x, y - 1) !== 0;
      const hasBottomTile = this.getTileAtXY(walls, x, y + 1) !== 0;
      const hasLeftTile = this.getTileAtXY(walls, x - 1, y) !== 0;
      const hasRightTile = this.getTileAtXY(walls, x + 1, y) !== 0;

      const hasLeftDoor =
        this.getTileAtXY(doors, x - 1, y) !== 0 &&
        this.getTileAtXY(walls, x - 2, y) !== 0 &&
        this.getTileAtXY(walls, x, y) !== 0;

      const hasRightDoor =
        this.getTileAtXY(doors, x + 1, y) !== 0 &&
        this.getTileAtXY(walls, x + 2, y) !== 0 &&
        this.getTileAtXY(walls, x, y) !== 0;

      const hasTopDoor =
        this.getTileAtXY(doors, x, y - 1) !== 0 &&
        this.getTileAtXY(walls, x, y - 2) !== 0 &&
        this.getTileAtXY(walls, x, y) !== 0;

      const hasBottomDoor =
        this.getTileAtXY(doors, x, y + 1) !== 0 &&
        this.getTileAtXY(walls, x, y + 2) !== 0 &&
        this.getTileAtXY(walls, x, y) !== 0;

      const hasTop = hasTopTile || hasTopDoor;
      const hasBottom = hasBottomTile || hasBottomDoor;
      const hasLeft = hasLeftTile || hasLeftDoor;
      const hasRight = hasRightTile || hasRightDoor;

      // "auto tiling" lol fuck you I'm doing this manually
      if (!hasTop && !hasBottom && !hasLeft && !hasRight) {
        return allowEmptyWalls ? wall : 0;
      }
      if (hasTop && hasBottom && hasLeft && hasRight) return wall + 1;
      if (!hasTop && hasBottom && hasLeft && hasRight) return wall + 2;
      if (hasTop && hasBottom && hasLeft && !hasRight) return wall + 3;

      if (hasTop && !hasBottom && hasLeft && hasRight) return wall + 4;
      if (hasTop && hasBottom && !hasLeft && hasRight) return wall + 5;
      if (!hasTop && hasBottom && !hasLeft && hasRight) return wall + 6;
      if (!hasTop && hasBottom && hasLeft && !hasRight) return wall + 7;

      if (hasTop && !hasBottom && hasLeft && !hasRight) return wall + 8;
      if (hasTop && !hasBottom && !hasLeft && hasRight) return wall + 9;
      if (!hasTop && hasBottom && !hasLeft && !hasRight) return wall + 10;
      if (!hasTop && !hasBottom && hasLeft && !hasRight) return wall + 11;

      if (hasTop && !hasBottom && !hasLeft && !hasRight) return wall + 12;
      if (!hasTop && !hasBottom && !hasLeft && hasRight) return wall + 13;
      if (hasTop && hasBottom && !hasLeft && !hasRight) return wall + 14;
      if (!hasTop && !hasBottom && hasLeft && hasRight) return wall + 15;

      return wall;
    });
  }

  autotileWater(water: number[]): number[] {
    return water.map((value, idx) => {
      if (value === 0) return 0;

      const { x, y } = this.getTileXYFromIndex(idx);

      const fluidNW = this.getTileAtXY(water, x - 1, y - 1) !== 0;
      const fluidN = this.getTileAtXY(water, x, y - 1) !== 0;
      const fluidNE = this.getTileAtXY(water, x + 1, y - 1) !== 0;
      const fluidE = this.getTileAtXY(water, x + 1, y) !== 0;
      const fluidSE = this.getTileAtXY(water, x + 1, y + 1) !== 0;
      const fluidS = this.getTileAtXY(water, x, y + 1) !== 0;
      const fluidSW = this.getTileAtXY(water, x - 1, y + 1) !== 0;
      const fluidW = this.getTileAtXY(water, x - 1, y) !== 0;

      if (
        !fluidNW &&
        fluidN &&
        fluidNE &&
        fluidE &&
        fluidSE &&
        fluidS &&
        fluidSW &&
        fluidW
      ) {
        return value + 1;
      } // NW corner missing
      if (
        fluidNW &&
        fluidN &&
        !fluidNE &&
        fluidE &&
        fluidSE &&
        fluidS &&
        fluidSW &&
        fluidW
      ) {
        return value + 2;
      } // NE corner missing
      if (
        fluidNW &&
        fluidN &&
        fluidNE &&
        fluidE &&
        !fluidSE &&
        fluidS &&
        fluidSW &&
        fluidW
      ) {
        return value + 3;
      } // SE corner missing
      if (
        fluidNW &&
        fluidN &&
        fluidNE &&
        fluidE &&
        fluidSE &&
        fluidS &&
        !fluidSW &&
        fluidW
      ) {
        return value + 4;
      } // SW corner missing

      if (
        !fluidNW &&
        fluidN &&
        !fluidNE &&
        fluidE &&
        fluidSE &&
        fluidS &&
        fluidSW &&
        fluidW
      ) {
        return value + 5;
      } // NE,NW corner missing
      if (
        fluidNW &&
        fluidN &&
        !fluidNE &&
        fluidE &&
        !fluidSE &&
        fluidS &&
        fluidSW &&
        fluidW
      ) {
        return value + 6;
      } // NE,SE corner missing
      if (
        fluidNW &&
        fluidN &&
        fluidNE &&
        fluidE &&
        !fluidSE &&
        fluidS &&
        !fluidSW &&
        fluidW
      ) {
        return value + 7;
      } // SE,SW corner missing
      if (
        !fluidNW &&
        fluidN &&
        fluidNE &&
        fluidE &&
        fluidSE &&
        fluidS &&
        !fluidSW &&
        fluidW
      ) {
        return value + 8;
      } // SW,NW corner missing

      if (
        !fluidNW &&
        fluidN &&
        !fluidNE &&
        fluidE &&
        fluidSE &&
        fluidS &&
        !fluidSW &&
        fluidW
      ) {
        return value + 9;
      } // NW,NE,SW corner missing
      if (
        !fluidNW &&
        fluidN &&
        !fluidNE &&
        fluidE &&
        !fluidSE &&
        fluidS &&
        fluidSW &&
        fluidW
      ) {
        return value + 10;
      } // NW,NE,SE corner missing
      if (
        fluidNW &&
        fluidN &&
        !fluidNE &&
        fluidE &&
        !fluidSE &&
        fluidS &&
        !fluidSW &&
        fluidW
      ) {
        return value + 11;
      } // NE,SE,SW corner missing
      if (
        !fluidNW &&
        fluidN &&
        fluidNE &&
        fluidE &&
        !fluidSE &&
        fluidS &&
        !fluidSW &&
        fluidW
      ) {
        return value + 12;
      } // NW,SE,SW corner missing

      if (
        !fluidNW &&
        fluidN &&
        !fluidNE &&
        fluidE &&
        !fluidSE &&
        fluidS &&
        !fluidSW &&
        fluidW
      ) {
        return value + 13;
      } // ALL corner missing

      if (!fluidN && fluidE && fluidSE && fluidS && fluidSW && fluidW) {
        return value + 14;
      } // N missing NE,NW unchecked
      if (fluidNW && fluidN && !fluidE && fluidS && fluidSW && fluidW) {
        return value + 15;
      } // E missing NE,SE unchecked
      if (fluidNW && fluidN && fluidNE && fluidE && !fluidS && fluidW) {
        return value + 16;
      } // S missing SE,SW unchecked
      if (fluidN && fluidNE && fluidE && fluidSE && fluidS && !fluidW) {
        return value + 17;
      } // W missing SW,NW unchecked

      if (!fluidNW && fluidN && fluidNE && fluidE && !fluidS && fluidW) {
        return value + 18;
      } // NW,S missing SE,SW unchecked
      if (fluidNW && fluidN && !fluidNE && fluidE && !fluidS && fluidW) {
        return value + 19;
      } // NE,S missing SE,SW unchecked
      if (!fluidN && fluidE && !fluidSE && fluidS && fluidSW && fluidW) {
        return value + 20;
      } // SE,N missing NE,NW unchecked
      if (!fluidN && fluidE && fluidSE && fluidS && !fluidSW && fluidW) {
        return value + 21;
      } // SW,N missing NE,NW unchecked

      if (!fluidNW && fluidN && !fluidE && fluidS && fluidSW && fluidW) {
        return value + 22;
      } // NW,E missing NE,SE unchecked
      if (fluidN && !fluidNE && fluidE && fluidSE && fluidS && !fluidW) {
        return value + 23;
      } // NE,W missing NW,SW unchecked
      if (fluidN && fluidNE && fluidE && !fluidSE && fluidS && !fluidW) {
        return value + 24;
      } // SE,W missing NW,SW unchecked
      if (fluidNW && fluidN && !fluidE && fluidS && !fluidSW && fluidW) {
        return value + 25;
      } // SW,E missing NE,SE unchecked

      if (!fluidN && fluidE && !fluidSE && fluidS && !fluidSW && fluidW) {
        return value + 26;
      } // SE,SW,N missing NW,NE unchecked
      if (!fluidNW && fluidN && !fluidE && fluidS && !fluidSW && fluidW) {
        return value + 27;
      } // NW,SW,E missing SE,NE unchecked
      if (!fluidNW && fluidN && !fluidNE && fluidE && !fluidS && fluidW) {
        return value + 28;
      } // NE,NW,S missing SE,SW unchecked
      if (fluidN && !fluidNE && fluidE && !fluidSE && fluidS && !fluidW) {
        return value + 29;
      } // NE,SE,W missing NW,SW unchecked

      if (!fluidN && fluidE && fluidSE && fluidS && !fluidW) return value + 30; // E,SE,S present, NE,SW,NW unchecked
      if (!fluidN && !fluidE && fluidS && fluidSW && fluidW) return value + 31; // W,SW,S present, NW,SE,NE unchecked
      if (fluidNW && fluidN && !fluidE && !fluidS && fluidW) return value + 32; // W,NW,N present, NE,SE,SW unchecked
      if (fluidN && fluidNE && fluidE && !fluidS && !fluidW) return value + 33; // E,NE,N present, NW,SE,SW unchecked

      if (!fluidN && fluidE && fluidS && !fluidW) return value + 34; // E,S present, CORNERS unchecked
      if (!fluidN && !fluidE && fluidS && fluidW) return value + 35; // W,S present, CORNERS unchecked
      if (fluidN && !fluidE && !fluidS && fluidW) return value + 36; // W,N present, CORNERS unchecked
      if (fluidN && fluidE && !fluidS && !fluidW) return value + 37; // E,N present, CORNERS unchecked

      if (!fluidN && !fluidE && fluidS && !fluidW) return value + 38; // S present, CORNERS unchecked
      if (!fluidN && !fluidE && !fluidS && fluidW) return value + 39; // W present, CORNERS unchecked
      if (fluidN && !fluidE && !fluidS && !fluidW) return value + 40; // N present, CORNERS unchecked
      if (!fluidN && fluidE && !fluidS && !fluidW) return value + 41; // E present, CORNERS unchecked

      if (fluidN && !fluidE && fluidS && !fluidW) return value + 42; // N,S present, CORNERS unchecked
      if (!fluidN && fluidE && !fluidS && fluidW) return value + 43; // E,W present, CORNERS unchecked

      if (
        !fluidNW &&
        fluidN &&
        fluidNE &&
        fluidE &&
        !fluidSE &&
        fluidS &&
        fluidSW &&
        fluidW
      ) {
        return value + 44;
      } // NW,SE missing
      if (
        fluidNW &&
        fluidN &&
        !fluidNE &&
        fluidE &&
        fluidSE &&
        fluidS &&
        !fluidSW &&
        fluidW
      ) {
        return value + 46;
      } // NE,SW missing

      if (
        fluidNW &&
        fluidN &&
        fluidNE &&
        fluidE &&
        fluidSE &&
        fluidS &&
        fluidSW &&
        fluidW
      ) {
        return value + 47;
      } // ALL present

      return value;
    });
  }

  addNPCs(possibleSpaces: IGeneratorMapNode[]): void {
    const addedNPCs: string[] = [];

    const numNPCs = this.rng.getItem(this.mapMeta.npcProps.npcCounts) ?? 0;

    for (let i = 0; i < numNPCs; i++) {
      if (addedNPCs.length >= numNPCs) continue;

      const validSpaces = possibleSpaces.filter(
        (check) =>
          !check.hasFluid &&
          !check.hasWall &&
          !check.hasFoliage &&
          !check.hasDecor &&
          !check.hasDenseDecor &&
          !check.hasOpaqueDecor,
      );

      const space = this.rng.getItem(validSpaces);
      if (!space || validSpaces.length === 0) {
        console.error(new Error('[Solokar] No valid map space for NPC.'));
        continue;
      }

      const { x, y } = space;

      const npc = this.rng.getItem(
        this.mapMeta.npcProps.validNPCs.filter(
          (checkNPC) => !addedNPCs.includes(checkNPC.props.tag as string),
        ),
      );

      if (npc) {
        addedNPCs.push(npc.props.tag as string);

        const obj = {
          gid: npc.gid,
          name: npc.name,
          x: x * 64,
          y: (y + 1) * 64,
          properties: {
            ...npc.props,
          },
        };

        this.addTiledObject(MapLayer.NPCs, obj);
      }
    }
  }

  addNaturalResources(possibleSpaces: IGeneratorMapNode[]): void {
    const validResources: string[] = [];

    if (this.mapTheme.floor.placeOre) {
      validResources.push(
        ...this.mapMeta.resourceProps.validOre.map((x) => x.id),
      );
    }
    if (this.mapTheme.floor.placeTwigs) {
      validResources.push(
        ...this.mapMeta.resourceProps.validTrees.map((x) => x.id),
      );
    }

    if (validResources.length === 0) return;

    const numResources = this.mapMeta.resourceProps.numResources;

    for (let i = 0; i < numResources; i++) {
      const validSpaces = possibleSpaces.filter(
        (check) =>
          !check.hasFluid &&
          !check.hasWall &&
          !check.hasFoliage &&
          !check.hasDecor &&
          !check.hasDenseDecor &&
          !check.hasOpaqueDecor,
      );

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
          tag: 'Global Single-resource',
        },
      };

      this.addTiledObject(MapLayer.Spawners, obj);
    }
  }

  addStairs(possibleSpaces: IGeneratorMapNode[]): void {
    const validSpaces = possibleSpaces.filter(
      (check) =>
        !check.hasFluid &&
        !check.hasWall &&
        !check.hasFoliage &&
        !check.hasDecor &&
        !check.hasDenseDecor &&
        !check.hasOpaqueDecor,
    );

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
        teleportTagRef: this.mapMeta.objProps.stairs.teleportTagRef,
      },
    };

    this.addSpoilerLog(`Stairs added at ${x}, ${y + 1}.`, true);

    this.addTiledObject(MapLayer.Interactables, obj);
  }

  setSuccorport(): void {
    this.addTiledObject(MapLayer.Succorport, {
      gid: 0,
      height: 64 * 110,
      visible: false,
      width: 64 * 110,
      x: 0,
      y: 0,
      properties: {
        restrictSuccor: true,
        restrictTeleport: true,
      },
    });
  }
}
