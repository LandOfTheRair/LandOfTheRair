/* eslint-disable no-bitwise */
/* eslint-disable no-underscore-dangle */

import { cloneDeep, difference, get, setWith } from 'lodash';
import * as Phaser from 'phaser';
import { Subscription } from 'rxjs';
import {
  basePlayerSprite,
  Direction,
  directionHasAll,
  directionHasAny,
  FOVVisibility,
  ICharacter,
  IMapData,
  INPC,
  IPlayer,
  ISimpleItem,
  ItemClass,
  MapLayer,
  ObjectType,
  positionAdd,
  positionDistanceFromZero,
  positionInRange,
  positionIsZero,
  positionSubtract,
  positionSurrounding,
  positionText,
  positionTileToWorld,
  positionWorldToTile,
  positionWorldXYToTile,
  spriteDirectionForWall,
  spriteForCreatureDirection,
  spriteTerrainForDirection,
  spriteTerrainSetNumber,
  Stat,
  TilesWithNoFOVUpdate,
} from '../../../../../interfaces';
import { MapRenderGame } from '../phasergame';

import decorAnimations from '../../../../../assets/content/_output/decoranims.json';
import spriteData from '../../../../../assets/content/_output/sprite-data.json';
import terrainAnimations from '../../../../../assets/content/_output/terrainanims.json';
import OutlinePipeline from '../../../../pipelines/OutlinePipeline';
import { TrueSightMap, TrueSightMapReversed } from '../tileconversionmaps';
import Sprite = Phaser.GameObjects.Sprite;

export class MapScene extends Phaser.Scene {
  // the current map in JSON form
  private allMapData: IMapData;
  public game: MapRenderGame;
  private layers: Record<string, Phaser.GameObjects.Container> = {
    fluids: null,
    decor: null,
    densedecor: null,
    opaquedecor: null,

    gold: null,
    groundItems: null,
    interactables: null,
    doorTops: null,

    otherEnvironmentalObjects: null,
    vfx: null,
    npcs: null,
    npcSprites: null,
    characterSprites: null,
  };

  private specialRenders = {
    truesight: false,
    eagleeye: false,
  };

  private firstCreate = true;
  private tilemap: Phaser.Tilemaps.Tilemap;
  private allNPCSprites = {};
  private allPlayerSprites = {};
  private fovSprites = {};
  private visibleItemSprites = {};
  private visibleItemUUIDHash = {};
  private goldSprites = {};
  private doorStateData = {};
  private doors = [];
  private doorTiledIdIsHorizontal = {};

  private playerUpdate$: Subscription;
  private currentTarget$: Subscription;
  private allPlayersUpdate$: Subscription;
  private allNPCsUpdate$: Subscription;
  private openDoorsUpdate$: Subscription;
  private groundUpdate$: Subscription;
  private windowUpdate$: Subscription;
  private vfxUpdate$: Subscription;
  private player: IPlayer;
  private targetUUID: string;

  private hideWelcome: boolean;

  private get isReady(): boolean {
    return this.sys as any;
  }

  private openDoors = {};
  private ground = {};

  constructor() {
    super({ key: 'MapScene' });
  }

  private createLayers() {
    Object.keys(this.layers).forEach((layer, index) => {
      this.layers[layer] = this.add.container();
      this.layers[layer].depth = index + 1;
    });
  }

  // create the fov / subfov sprites
  private createFOV() {
    // if the fov was made before, remove and re-create (we're changing maps)
    if (this.textures.exists('black')) {
      this.textures.remove('black');
    }

    const blackBitmapData = this.textures.createCanvas('black', 64, 64);
    blackBitmapData.context.fillStyle = '#000';
    blackBitmapData.context.fillRect(0, 0, 64, 64);
    blackBitmapData.refresh();

    for (let x = -4; x <= 4; x++) {
      for (let y = -4; y <= 4; y++) {
        const dark = this.add.sprite(
          64 * (x + 4) + 32,
          64 * (y + 4) + 32,
          blackBitmapData as any,
        );
        dark.setAlpha(0);
        dark.setScrollFactor(0);
        dark.setDepth(9999);

        setWith(this.fovSprites, [x, y], dark, Object);
        this.fovSprites[x][y] = dark;
      }
    }
  }

  // npc sprite stuff
  private updateNPCSprite(npc: INPC) {
    if (!this.isReady) return;

    const newFrame = spriteForCreatureDirection(npc.sprite, npc.dir);

    let sprite = this.allNPCSprites[npc.uuid];
    if (!sprite || !sprite.active) {
      if (sprite) sprite.destroy();

      sprite = this.add.sprite(0, 0, 'Creatures', newFrame);
      sprite.setPipeline('OutlinePipeline');
      this.layers.npcSprites.add(sprite);
      this.allNPCSprites[npc.uuid] = sprite;
    } else {
      sprite.setFrame(newFrame);
    }

    if (npc.dir === Direction.Center) {
      sprite.setAlpha(0);
    }

    if (!npc.aquaticOnly) {
      this.updateSpriteSwimData(sprite, npc);
    }

    this.updateSpritePositionalData(sprite, npc);

    this.stealthUpdate(sprite, npc);
  }

  private updateTarget(character: ICharacter) {
    if (!this.isReady) return;

    const oldUUID = this.targetUUID;
    const newUUID = character?.uuid;
    if (oldUUID === newUUID) return;

    this.setOutline(oldUUID, undefined);
    this.setOutline(newUUID, [1.0, 0.0, 0.0, 0.5]);
    this.targetUUID = newUUID;
  }

  private setOutline(uuid: string, color: number[]) {
    if (!uuid) return;

    const target = this.allNPCSprites[uuid] as Sprite;
    if (!target) return;

    OutlinePipeline.setOutlineColor(target, color);
  }

  private removeNPCSprite(uuid: string) {
    const sprite = this.allNPCSprites[uuid];
    if (!sprite) return;

    delete this.allNPCSprites[uuid];
    sprite.destroy();
  }

  // player sprite stuff
  private updatePlayerSprite(player: IPlayer) {
    if (!this.isReady) return;

    const sprite = this.allPlayerSprites[player.uuid];
    if (!sprite) {
      this.createPlayerSprite(player);
      return;
    }

    this.updatePlayerSpriteData(sprite, player);
  }

  private removePlayerSprite(uuid: string) {
    const sprite = this.allPlayerSprites[uuid];
    if (!sprite) return;

    delete this.allPlayerSprites[uuid];
    sprite.destroy();
  }

  private createPlayerSprite(player: IPlayer) {
    if (!this.isReady) return null;

    const spriteGenderBase = basePlayerSprite(player);

    const sprite = this.add.sprite(
      this.convertPosition(player.x),
      this.convertPosition(player.y),
      'Creatures',
      spriteForCreatureDirection(spriteGenderBase, player.dir),
    );
    sprite.setPipeline('OutlinePipeline');

    this.layers.characterSprites.add(sprite);

    this.allPlayerSprites[player.uuid] = sprite;

    this.updatePlayerSpriteData(sprite, player);

    return sprite;
  }

  private updateSelf(player: IPlayer) {
    if (!player) return;
    const hasGrayEffect = this.cameras.main.hasPostPipeline;
    if (player.hp.current <= 0) {
      if (!hasGrayEffect) {
        this.cameras.main.setPostPipeline('GrayPostFXPipeline');
      }
    } else {
      if (hasGrayEffect) {
        this.cameras.main.resetPostPipeline();
      }
    }
    this.updateFOV();
  }

  private isFovBlocker(x: number, y: number): boolean {
    if (!this.player) return false;

    const map = this.allMapData.tiledJSON;
    const { width, layers } = map;

    const totalX = x + this.player.x;
    const totalY = y + this.player.y;

    // doors can only be fov blockers if they're horizontal doors, ie, top/bottom opening
    const potentialDoor = get(
      this.allMapData.layerData[this.getLayer(MapLayer.Interactables)],
      [totalX, totalY],
    );
    if (potentialDoor?.type === ObjectType.Door) {
      if (!this.openDoors[potentialDoor.id]) {
        return !this.doorTiledIdIsHorizontal[potentialDoor.id];
      }
    }

    const potentialSecretWall = get(
      this.allMapData.layerData[this.getLayer(MapLayer.OpaqueDecor)],
      [totalX, totalY],
    );
    const wallList =
      layers[this.getLayer(MapLayer.Walls)].data ||
      layers[this.getLayer(MapLayer.Walls)].tileIds;
    const wallLayerTile = wallList[width * totalY + totalX];

    return (
      (potentialSecretWall?.type === ObjectType.SecretWall &&
        !this.specialRenders.truesight) ||
      (wallLayerTile !== TilesWithNoFOVUpdate.Empty &&
        wallLayerTile !== TilesWithNoFOVUpdate.Air)
    );
  }

  // update the fov sprites whenever we get new fov
  private updateFOV() {
    const isPlayerInGame = this.allPlayerSprites[this.player.uuid];
    positionInRange({ x: 0, y: 0 }, 4, (position) => {
      const fovSprite = this.fovSprites[position.x][position.y] as Sprite;
      fovSprite.setDisplayOrigin(32, 32);
      fovSprite.setDisplaySize(64, 64);
      fovSprite.setAlpha(1);
      if (!isPlayerInGame) return;

      const tileFov =
        get(this.player.fov, [position.x, position.y]) ?? FOVVisibility.CantSee;
      switch (tileFov) {
        case FOVVisibility.CantSee:
          return;

        case FOVVisibility.CanSeeButDark:
          if (!this.canSeeThroughDarkAt(position.x, position.y)) return;
          fovSprite.setAlpha(0.5);
          break;

        case FOVVisibility.CanSee:
          fovSprite.setAlpha(0);
          break;
      }

      const isWallHere = this.isFovBlocker(position.x, position.y);
      if (!isWallHere) return;
      const fovDirections = positionSurrounding().reduce(
        (combinedDirections, tileOffset) =>
          !(
            get(this.player.fov, [
              position.x + tileOffset.x,
              position.y + tileOffset.y,
            ]) ?? FOVVisibility.CantSee
          )
            ? combinedDirections | tileOffset.direction
            : combinedDirections,
        Direction.Center,
      );
      if (fovDirections === Direction.Center) {
        return;
      }
      fovSprite.setAlpha(1);

      const cutDownRight = () => {
        fovSprite.setDisplayOrigin(-11, 21);
        fovSprite.setDisplaySize(46, 51);
      };
      const cutRight = () => {
        fovSprite.setDisplayOrigin(-15, 32);
        fovSprite.setDisplaySize(32, 64);
      };
      const cutLeft = () => {
        fovSprite.setDisplayOrigin(80, 32);
        fovSprite.setDisplaySize(32, 64);
      };
      if (directionHasAll(fovDirections, Direction.WestAndEast)) return;
      switch (fovDirections as number) {
        case 0b011_0_1_000:
        case 0b111_0_1_000:
        case 0b111_0_1_001:
        case 0b011_0_1_001:
          cutRight();
          return;

        case 0b110_1_0_000:
        case 0b111_1_0_000:
        case 0b111_1_0_100:
        case 0b110_1_0_100:
          cutLeft();
          return;

        case 0b100_1_0_110:
        case 0b001_0_1_011:
        case 0b100_1_0_111:
        case 0b001_0_1_111:
        case 0b000_0_1_111:
        case 0b000_1_0_111:
          return;

        case Direction.South:
        case Direction.Northwest:
        case Direction.Northeast:
          fovSprite.setAlpha(0);
          return;

        case Direction.Southeast:
          cutDownRight();
          return;

        case Direction.Southwest:
          fovSprite.setOrigin(1.12, 0.27);
          return;

        default:
          if (directionHasAny(fovDirections, Direction.North)) {
            if (directionHasAny(fovDirections, Direction.South)) return;
            fovSprite.setAlpha(0);
            return;
          }
          if (directionHasAny(fovDirections, Direction.South)) {
            if (directionHasAny(fovDirections, Direction.North)) return;
            fovSprite.setOrigin(0.5, 0.27);
            return;
          }
          if (directionHasAny(fovDirections, Direction.East)) {
            if (directionHasAny(fovDirections, Direction.West)) return;
            cutRight();
            return;
          }
          if (directionHasAny(fovDirections, Direction.West)) {
            if (directionHasAny(fovDirections, Direction.East)) return;
            cutLeft();
            return;
          }
      }
    });
  }

  private canSeeThroughDarkAt(x: number, y: number): boolean {
    if (!this.player) return false;
    if (this.player.effects._hash.Blind) return false;

    const darkCheck =
      get(this.player.fov, [x, y]) === FOVVisibility.CanSeeButDark;
    return darkCheck && !!this.player.effects._hash.DarkVision;
  }

  private updateDoors() {
    this.doors.forEach((door) => {
      const doorData = this.doorStateData[door.frame];
      let state = 'default';
      if (this.openDoors[door.id]) {
        state = 'opened';
      }

      if (door.lastState === state) return;

      door.sprites.forEach((s) => {
        s.destroy();
      });
      door.sprites = [];
      door.lastState = state;

      const stateData = doorData.states[state];
      stateData.forEach((spriteD) => {
        const spriteTilePos = positionAdd(door.tilePos, spriteD);
        const spriteWorldPos = positionTileToWorld(spriteTilePos);
        const sprite = this.add.sprite(
          spriteWorldPos.x,
          spriteWorldPos.y,
          spriteD.spritesheetName,
          spriteD.spritesheetId,
        );
        door.sprites.push(sprite);

        sprite.setInteractive();
        if (door.sprites.length > 1) {
          sprite.setDepth(99);
        }

        sprite.setPipeline('OutlinePipeline');
        if (stateData.length > 1) {
          OutlinePipeline.setNoEdge(sprite, true);
        }

        sprite.on('pointerover', () => {
          door.sprites.forEach((related) => {
            OutlinePipeline.setOutlineColor(related, [1.0, 1.0, 0.0, 0.5]);
          });
        });

        sprite.on('pointerout', () => {
          door.sprites.forEach((related) => {
            OutlinePipeline.setOutlineColor(related, undefined);
          });
        });
      });
    });
  }

  private convertPosition(lowPosition: number, centerOn?: boolean): number {
    return lowPosition * 64 + (centerOn ? 32 : 0);
  }

  /**
   * Detects if floor below wall should be cut, and fixes it
   */
  private fixWallFloors(map: Phaser.Tilemaps.Tilemap): void {
    const wallIndexOffset = map.getTileset('Walls').firstgid;
    const floorIndexOffset = map.getTileset('Terrain').firstgid;

    const getFloorSet = (floor: Phaser.Tilemaps.Tile) =>
      spriteTerrainSetNumber(floor.index - floorIndexOffset);

    const getFloorSetAt = (x: number, y: number) => {
      const floorSet = getFloorSet(map.getTileAt(x, y, true, 'Floors'));
      if (floorSet < 0) {
        return getFloorSet(map.getTileAt(x, y, true, 'Terrain'));
      }
      return floorSet;
    };

    const getWallIndex = (wall: Phaser.Tilemaps.Tile) =>
      wall.index - wallIndexOffset;

    const getWallIndexAt = (x: number, y: number) =>
      getFloorSet(map.getTileAt(x, y, true, 'Walls'));

    const cutLeft = (floor: Phaser.Tilemaps.Tile) => {
      floor.width = 32;
      floor.pixelX += 32;
    };

    const cutRight = (floor: Phaser.Tilemaps.Tile) => {
      floor.width = 50;
    };

    const walls = map.getTilesWithin(
      0,
      0,
      map.width,
      map.height,
      { isNotEmpty: true },
      'Walls',
    );

    walls.forEach((wall) => {
      const wallIndex = getWallIndex(wall);
      const wallDir = spriteDirectionForWall(wallIndex);

      // If this wall extends all the way left, and right, no cut
      if (directionHasAll(wallDir, Direction.WestAndEast)) return;

      // If this wall does not connect up, or down, no cut
      if (!directionHasAny(wallDir, Direction.NorthAndSouth)) return;
      const floor = map.getTileAt(wall.x, wall.y, false, 'Floors');

      //If this wall has no floor we can cut...then... no cut
      if (!floor) return;

      const floorC = getFloorSet(floor);
      const floorL = getFloorSetAt(wall.x - 1, wall.y);
      const floorR = getFloorSetAt(wall.x + 1, wall.y);

      //If we are between two identical floors, no cut
      if (floorL === floorR) return;

      //If this floor matches the floor to the right, cut it
      if (floorC === floorR) {
        cutLeft(floor);
        return;
      }

      //If this floor matches the floor to the left, cut it
      if (floorC === floorL) {
        cutRight(floor);
        return;
      }

      const wallLeft = getWallIndexAt(wall.x - 1, wall.y);

      //If the left wall is trying to connect to us, we can cut the right
      if (directionHasAny(spriteDirectionForWall(wallLeft), Direction.East)) {
        cutRight(floor);
      }

      const wallRight = getWallIndexAt(wall.x - 1, wall.y);

      //If the right wall is trying to connect to us, we can cut the left
      if (directionHasAny(spriteDirectionForWall(wallRight), Direction.West)) {
        cutLeft(floor);
      }
    });
  }

  private fixDoorFloor(worldX: number, worldY: number) {
    const floorIndexOffset = this.tilemap.getTileset('Terrain').firstgid;

    const getFloorSet = (floor: Phaser.Tilemaps.Tile) =>
      spriteTerrainSetNumber(floor.index - floorIndexOffset);

    const getFloorSetAt = (x: number, y: number) =>
      getFloorSet(this.tilemap.getTileAt(x, y, true, 'Floors'));

    const doorFloor = this.tilemap.getTileAtWorldXY(
      worldX,
      worldY - 1,
      false,
      null,
      'Floors',
    );
    if (doorFloor) {
      const floorC = getFloorSet(doorFloor);
      const floorL = getFloorSetAt(doorFloor.x - 1, doorFloor.y);
      const floorR = getFloorSetAt(doorFloor.x + 1, doorFloor.y);
      if (floorL !== floorR) {
        if (floorC === floorR) {
          doorFloor.width = 32;
          doorFloor.pixelX += 32;
        } else if (floorC === floorL) {
          doorFloor.width = 50;
        }
      }
    }
  }

  private loadAnimations() {
    Object.values(decorAnimations).forEach((animData) => {
      const animOffset = animData.frame;
      const animSpeed = (animData as any).speed ?? 7;

      this.anims.create({
        key: 'decor-' + animOffset.toString(),
        frameRate: animSpeed,
        frames: this.anims.generateFrameNumbers('DecorAnimations', {
          start: animOffset * 4 + 1,
          end: animOffset * 4 + 3,
        }),
        repeat: -1,
      });
    });

    Object.values(terrainAnimations).forEach((animData) => {
      const animOffset = animData.frame;
      const animSpeed = (animData as any).speed ?? 2;

      this.anims.create({
        key: 'terrain-' + animOffset.toString(),
        frameRate: animSpeed,
        frames: this.anims.generateFrameNumbers('TerrainAnimations', {
          start: animOffset * 4 + 1,
          end: animOffset * 4 + 3,
        }),
        repeat: -1,
        yoyo: true,
      });
    });
  }

  private loadTerrainAnimations(layer) {
    layer.data.forEach((tile, i) => {
      if (!terrainAnimations[tile]) return;

      if (
        this.allMapData.tiledJSON.layers[this.getLayer(MapLayer.Walls)].data[i]
      ) {
        return;
      }

      const x = Math.floor(i % layer.width);
      const y = Math.floor((i - x) / layer.width);

      const sprite = this.add.sprite(
        this.convertPosition(x, true),
        this.convertPosition(y, true),
        'TerrainAnimations',
        terrainAnimations[tile].frame,
      );

      sprite.play('terrain-' + terrainAnimations[tile].frame.toString());

      this.layers.fluids.add(sprite);
    });
  }

  private loadObjectLayer(layer, layerGroup) {
    const decorFirstGid = this.allMapData.tiledJSON.tilesets[2].firstgid;
    const wallFirstGid = this.allMapData.tiledJSON.tilesets[1].firstgid;

    const isSubscribed = this.player.subscriptionTier > 0;

    layer.objects.forEach((obj) => {
      // hide fillables, since they have the correct thing beneath
      if (obj.type === 'Fillable') return;

      const isWall = obj.gid < decorFirstGid;
      const firstGid = isWall ? wallFirstGid : decorFirstGid;
      const tileSet = isWall ? 'Walls' : 'Decor';
      const frame = obj.gid - firstGid;
      const tilePos = positionWorldToTile(obj);
      tilePos.y -= 1;
      if (obj.type === 'Door') {
        const doorData = this.doorStateData[frame];
        if (doorData) {
          if (doorData.direction & Direction.WestAndEast) {
            this.doorTiledIdIsHorizontal[obj.id] = true;
          }

          this.fixDoorFloor(obj.x, obj.y);
          this.doors.push({
            id: obj.id,
            tilePos,
            frame,
            sprites: [],
            lastState: 'none',
          });
          return;
        }
      }

      const sprite = this.add.sprite(obj.x + 32, obj.y - 32, tileSet, frame);
      const anim = decorAnimations[obj.gid - firstGid];
      if (anim) {
        sprite.play('decor-' + anim.frame.toString());
      }

      // if you're not subscribed, some objects are not visible
      if (obj.properties?.subscriberOnly) {
        sprite.visible = isSubscribed;
      }

      // surprisingly interactables can be interacted with
      if (
        obj.type === 'StairsUp' ||
        obj.type === 'StairsDown' ||
        obj.type === 'ClimbUp' ||
        obj.type === 'ClimbDown' ||
        obj.type === 'Door'
      ) {
        sprite.setInteractive();
      }

      if (obj.type === 'StairsUp' || obj.type === 'StairsDown') {
        sprite.setInteractive();
        sprite.setPipeline('OutlinePipeline');

        sprite.on('pointerover', () => {
          OutlinePipeline.setOutlineColor(sprite, [1.0, 1.0, 0.0, 0.5]);
        });

        sprite.on('pointerout', () => {
          OutlinePipeline.setOutlineColor(sprite, undefined);
        });
      }

      layerGroup.add(sprite);
    });
  }

  // create sprite click functionality for stairs, doors, etc
  private setupMapInteractions() {
    this.input.mouse.disableContextMenu();

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.player || pointer.rightButtonReleased()) return;

      const clickedTilePostion = positionWorldXYToTile(pointer);
      const playerToClickedOffset = positionSubtract(
        clickedTilePostion,
        this.player,
      );

      const doCommand = (command: string) => {
        this.game.socketService.sendAction({
          command,
          args: positionText(playerToClickedOffset),
        });
      };
      const interactTile =
        this.allMapData.layerData[this.getLayer(MapLayer.Interactables)]?.[
          clickedTilePostion.x
        ]?.[clickedTilePostion.y];
      if (interactTile) {
        switch (interactTile.type as ObjectType) {
          case 'Fall':
          case 'Teleport':
            return doCommand('~move');
          case 'StairsUp':
          case 'StairsDown':
            if (!positionIsZero(playerToClickedOffset)) break;
            return doCommand('~up');
          case 'ClimbUp':
          case 'ClimbDown':
            if (!positionIsZero(playerToClickedOffset)) break;
            return doCommand('~climbup');
        }
        // Check if tile is next to, or under the player
        if (positionDistanceFromZero(playerToClickedOffset) <= 1) {
          doCommand('!interact');
        }
      }

      if (positionIsZero(playerToClickedOffset)) return;
      return doCommand('~move');
    });
  }

  public init(data) {
    this.hideWelcome = data.hideWelcome;
    this.player = data.player;

    if (data.resetVisibilityFlags) {
      this.specialRenders.truesight = false;
      this.specialRenders.eagleeye = false;
    }
  }

  public create() {
    if (!this.firstCreate) {
      this.visibleItemSprites = {};
      this.visibleItemUUIDHash = {};
      this.goldSprites = {};
      this.doors = [];
    }
    const player = this.game.observables.player.getValue();
    this.player = player;

    // set up map - must happen first
    const mapData = { ...this.game.observables.map.getValue() };
    const tiledJSON = { ...cloneDeep(mapData.tiledJSON) };

    tiledJSON.tileWidth = tiledJSON.tilewidth;
    tiledJSON.tileHeight = tiledJSON.tileheight;

    this.backfillAirUnderEverything(tiledJSON);

    mapData.tiledJSON = tiledJSON;
    this.allMapData = mapData;

    // create some phaser data
    this.createLayers();
    this.createFOV();
    this.setupMapInteractions();

    spriteData.doorStates.forEach((doorState) => {
      this.doorStateData[doorState.tiledId] = doorState;
    });

    this.cache.tilemap.add('map', {
      data: tiledJSON,
      format: Phaser.Tilemaps.Formats.TILED_JSON,
    });

    const map = this.make.tilemap({ key: 'map' });
    this.tilemap = map;
    // add tilesets for maps
    map.addTilesetImage('Terrain', 'Terrain');
    map.addTilesetImage('Walls', 'Walls');
    map.addTilesetImage('Decor', 'Decor');

    // create the base 5 layers
    map.createLayer('Air', ['Decor']);
    map.createLayer('Terrain', ['Decor', 'Terrain']);
    map.createLayer('Floors', ['Decor', 'Terrain']);
    map.createLayer('Fluids', ['Decor', 'Terrain']);
    map.createLayer('Foliage', 'Decor');
    map.createLayer('Walls', ['Walls', 'Decor']);

    this.fixWallFloors(map);

    this.loadAnimations();

    // load terrain animations before everything else
    this.loadTerrainAnimations(
      tiledJSON.layers[this.getLayer(MapLayer.Fluids)],
    );

    // decor, densedecor, opaquedecor, interactables
    this.loadObjectLayer(map.objects[0], this.layers.decor);
    this.loadObjectLayer(map.objects[1], this.layers.densedecor);
    this.loadObjectLayer(map.objects[2], this.layers.opaquedecor);
    this.loadObjectLayer(map.objects[3], this.layers.interactables);

    if (this.firstCreate) {
      this.registerEvents();

      // update the loader as we load the map
      let text = `Welcome to ${this.game.gameService.reformatMapName(
        player.map,
      )}!`;
      if (tiledJSON.properties.creator) {
        text = `${text}<br><small><em>Created by ${tiledJSON.properties.creator}</em></small>`;
      }

      if (this.hideWelcome) text = '';

      this.game.observables.loadPercent.next(text);
      setTimeout(() => {
        this.game.observables.loadPercent.next('');
      }, 1000);
    } else {
      this.createPlayerSprite(player);
    }

    // start the camera at our x,y
    this.cameras.main.centerOn(
      this.convertPosition(player.x, true),
      this.convertPosition(player.y, true),
    );

    this.game.observables.hideMap.next(false);
    setTimeout(() => {
      this.game.gameService.sendCommandString('!move 0 0');
    }, 1000);
    this.updateGroundSprites();
    this.firstCreate = false;
  }

  private backfillAirUnderEverything(tiledJSON) {
    const newLayer = structuredClone(tiledJSON.layers[0]);
    newLayer.id = 0;
    newLayer.name = 'Air';
    newLayer.data = newLayer.data.map(() => 2386);
    tiledJSON.layers.unshift(newLayer);
  }

  private registerEvents() {
    // watch for and update map bounds when the window moves
    this.windowUpdate$ = this.game.observables.windowChange.subscribe(() => {
      try {
        this.scale.updateBounds();
      } catch {}
    });

    // watch for incoming vfx so we can render them
    this.vfxUpdate$ = this.game.observables.vfx.subscribe((vfx) => {
      this.drawVFX(vfx);
    });

    this.currentTarget$ = this.game.observables.target.subscribe(
      (updTarget) => {
        this.updateTarget(updTarget);
      },
    );

    // watch for player updates
    this.playerUpdate$ = this.game.observables.player.subscribe((updPlayer) => {
      this.player = updPlayer;
      this.updatePlayerSprite(updPlayer);
      this.updateSelf(updPlayer);
      this.checkTruesight(updPlayer);
      this.checkEagleEye(updPlayer);
    });

    // watch for other players to come in
    this.allPlayersUpdate$ = this.game.observables.allPlayers.subscribe(
      (allPlayers) => {
        const curPlayers = Object.keys(this.allPlayerSprites).filter(
          (f) => f !== this.player.uuid,
        );
        const newPlayers = Object.keys(allPlayers);

        Object.values(allPlayers).forEach((p) =>
          this.updatePlayerSprite(p as IPlayer),
        );

        const diff = difference(curPlayers, newPlayers);
        diff.forEach((p) => this.removePlayerSprite(p));
      },
    );

    // watch for npcs to come in
    this.allNPCsUpdate$ = this.game.observables.allNPCs.subscribe((allNPCs) => {
      const curNPCs = Object.keys(this.allNPCSprites);
      const newNPCs = Object.keys(allNPCs);

      Object.values(allNPCs).forEach((p) => this.updateNPCSprite(p as INPC));

      const diff = difference(curNPCs, newNPCs);

      diff.forEach((p) => this.removeNPCSprite(p));
    });

    this.openDoorsUpdate$ = this.game.observables.openDoors.subscribe(
      (openDoors) => {
        this.openDoors = openDoors;
      },
    );

    this.groundUpdate$ = this.game.observables.ground.subscribe((ground) => {
      this.ground = ground;
      this.removeOldItemSprites();
      this.updateGroundSprites();
    });

    this.events.on('destroy', () => this.destroy());
  }

  public update() {
    if (!this.player) return;
    this.cameras.main.centerOn(
      this.convertPosition(this.player.x, true),
      this.convertPosition(this.player.y, true),
    );
    this.updateFOV();
    this.updateDoors();
  }

  private destroy() {
    if (this.playerUpdate$) this.playerUpdate$.unsubscribe();
    if (this.currentTarget$) this.currentTarget$.unsubscribe();
    if (this.allPlayersUpdate$) this.allPlayersUpdate$.unsubscribe();
    if (this.allNPCsUpdate$) this.allNPCsUpdate$.unsubscribe();
    if (this.openDoorsUpdate$) this.openDoorsUpdate$.unsubscribe();
    if (this.groundUpdate$) this.groundUpdate$.unsubscribe();
    if (this.windowUpdate$) this.windowUpdate$.unsubscribe();
    if (this.vfxUpdate$) this.vfxUpdate$.unsubscribe();
  }

  private getLayer(layer: MapLayer) {
    return layer + 1;
  }

  // set stealth on a character. if we can see it and they have stealth set they're hiding, but not well
  private stealthUpdate(sprite: Sprite, character: ICharacter) {
    if (character.hp.current <= 0) return;

    const isHidden =
      (character.totalStats?.[Stat.Stealth] ?? 0) > 0 &&
      character.effects._hash.Hidden;
    OutlinePipeline.setAlpha(sprite, isHidden ? 0.15 : 1);
  }

  // sprite updates
  private updatePlayerSpriteData(sprite: Sprite, player: IPlayer) {
    const firstSpriteOverideEffect = Object.values(player.effects._hash).filter(
      (e) => e.effectInfo?.spriteChange > -1,
    )[0]?.effectInfo.spriteChange;

    const playerFrame = spriteForCreatureDirection(
      firstSpriteOverideEffect ?? basePlayerSprite(player),
      player.dir,
    );
    sprite.setFrame(playerFrame);

    this.updateSpriteSwimData(sprite, player);
    this.updateSpritePositionalData(sprite, player);
    sprite.setAlpha(player.hp.current <= 0 ? 0 : 1);

    this.stealthUpdate(sprite, player);
  }

  private updateSpritePositionalData(sprite: Sprite, char: ICharacter) {
    sprite.x = this.convertPosition(char.x, true);
    sprite.y = this.convertPosition(char.y, true);
  }

  private updateSpriteSwimData(sprite: Sprite, char: ICharacter) {
    const tileCheck = char.y * this.allMapData.tiledJSON.width + char.x;
    const fluid =
      this.allMapData.tiledJSON.layers[this.getLayer(MapLayer.Fluids)].data;
    const isSwimming = !!fluid[tileCheck];
    OutlinePipeline.setSwimming(sprite, isSwimming);
  }

  // eagleye functions
  private checkEagleEye(player: IPlayer) {
    const hasEagleEye = player.effects._hash.EagleEye;

    if (this.specialRenders.eagleeye && !hasEagleEye) {
      this.handleEagleEye(false);
    }

    if (!this.specialRenders.eagleeye && hasEagleEye) {
      this.handleEagleEye(true);
    }
  }

  private handleEagleEye(canSeeEagleEye: boolean) {
    this.specialRenders.eagleeye = canSeeEagleEye;
  }

  // truesight functions
  private checkTruesight(player: IPlayer) {
    const hasTruesight = player.effects._hash.TrueSight;

    if (this.specialRenders.truesight && !hasTruesight) {
      this.handleTruesight(false);
    }

    if (!this.specialRenders.truesight && hasTruesight) {
      this.handleTruesight(true);
    }
  }

  private handleTruesight(canSeeTruesight: boolean) {
    this.specialRenders.truesight = canSeeTruesight;

    this.layers.opaquedecor.each((sprite: Sprite) => {
      if (canSeeTruesight && TrueSightMap[sprite.frame.name]) {
        sprite.setTexture('Decor', +TrueSightMap[sprite.frame.name]);
      } else if (!canSeeTruesight && TrueSightMapReversed[sprite.frame.name]) {
        sprite.setTexture('Walls', +TrueSightMapReversed[sprite.frame.name]);
      }
    });
  }

  // check if something is in range
  private notInRange(centerX: number, centerY: number, x: number, y: number) {
    return (
      x < centerX - 4 || x > centerX + 4 || y < centerY - 4 || y > centerY + 4
    );
  }

  // item-render functions
  private canCreateItemSpriteAt(x: number, y: number): boolean {
    const tileCheck = y * this.allMapData.tiledJSON.width + x;
    const fluid =
      this.allMapData.tiledJSON.layers[this.getLayer(MapLayer.Fluids)].data;
    const foliage =
      this.allMapData.tiledJSON.layers[this.getLayer(MapLayer.Foliage)].data;
    return (
      this.specialRenders.eagleeye || (!fluid[tileCheck] && !foliage[tileCheck])
    );
  }

  private updateGroundSprites() {
    for (let x = this.player.x - 4; x <= this.player.x + 4; x++) {
      const itemsX = this.ground[x];
      if (!itemsX) continue;

      for (let y = this.player.y - 4; y <= this.player.y + 4; y++) {
        const itemsXY = this.ground[x][y];
        if (!itemsXY) continue;

        // Get the number of items on the tile, by summing the amount of items in each array
        const numItemsHere = Object.keys(itemsXY)
          .map((type) => itemsXY[type].length)
          .reduce((a, b) => a + b, 0);

        Object.keys(itemsXY).forEach((itemType) => {
          if (
            itemsXY[itemType].length === 0 ||
            (itemType === ItemClass.Coin && numItemsHere > 1)
          ) {
            if (get(this.goldSprites, [x, y])) this.createTreasureSprite(x, y);
            return;
          }

          const item = itemsXY[itemType][0].item;
          if (!this.canCreateItemSpriteAt(x, y)) return;
          this.createItemSprite(item, x, y);
          this.createTreasureSprite(x, y);
        });
      }
    }
  }

  private createItemSprite(item: ISimpleItem, x: number, y: number) {
    const realItem = this.game.assetService.getItem(item.name);
    if (!realItem) return;

    if (!this.visibleItemSprites[x]) this.visibleItemSprites[x] = {};
    if (!this.visibleItemSprites[x][y]) this.visibleItemSprites[x][y] = {};
    if (!this.visibleItemSprites[x][y][realItem.itemClass]) {
      this.visibleItemSprites[x][y][realItem.itemClass] = null;
    }

    const currentItemSprite = this.visibleItemSprites[x][y][realItem.itemClass];

    if (currentItemSprite) {
      if (currentItemSprite.uuid === item.uuid) {
        return;
      } else {
        currentItemSprite.destroy();
      }
    }

    const isCorpse = realItem.itemClass === ItemClass.Corpse;
    const spritesheet = isCorpse ? 'Creatures' : 'Items';
    const itemSpriteNumber = isCorpse
      ? item.mods.sprite
      : item.mods.sprite ?? realItem.sprite;
    const sprite = this.add.sprite(
      32 + x * 64,
      32 + y * 64,
      spritesheet,
      itemSpriteNumber,
    ) as any;
    this.visibleItemSprites[x][y][realItem.itemClass] = sprite;
    this.visibleItemUUIDHash[sprite.uuid] = sprite;

    sprite._realX = x;
    sprite._realY = y;
    sprite.itemClass = realItem.itemClass;
    sprite.uuid = item.uuid;

    this.layers.groundItems.add(sprite);
  }

  private createTreasureSprite(x: number, y: number) {
    const spritePos = this.goldSpriteForLocation(x, y);
    if (!spritePos) return;

    if (!this.goldSprites[x]) this.goldSprites[x] = {};

    const currentItemSprite = this.goldSprites[x][y];

    if (currentItemSprite) {
      if (spritePos === currentItemSprite.frame.name) return;
      currentItemSprite.destroy();
    }

    const sprite = this.add.sprite(
      32 + x * 64,
      32 + y * 64,
      'Terrain',
      spritePos,
    ) as any;
    this.goldSprites[x][y] = sprite;

    sprite._realX = x;
    sprite._realY = y;

    this.layers.gold.add(sprite);
  }

  private removeOldItemSprites() {
    this.layers.groundItems.each((sprite) => {
      const x = sprite._realX;
      const y = sprite._realY;

      let ground = this.ground[x] ? this.ground[x][y] : null;
      ground = ground || {};

      const myGround = ground[sprite.itemClass] || [];
      if (
        this.notInRange(this.player.x, this.player.y, x, y) ||
        !myGround ||
        !myGround[0] ||
        myGround[0].item.uuid !== sprite.uuid
      ) {
        delete this.visibleItemUUIDHash[sprite.uuid];
        this.visibleItemSprites[x][y][sprite.itemClass] = null;
        sprite.destroy();
      }
    });

    this.layers.gold.each((sprite) => {
      const x = sprite._realX;
      const y = sprite._realY;

      let ground = this.ground[x] ? this.ground[x][y] : null;
      ground = ground || {};

      if (
        this.notInRange(this.player.x, this.player.y, x, y) ||
        !ground[ItemClass.Coin]
      ) {
        this.goldSprites[x][y] = null;
        sprite.destroy();
      }
    });
  }

  private drawVFX(vfxData): void {
    const { vfx, vfxX, vfxY, vfxRadius, vfxTimeout } = vfxData;

    for (let x = vfxX - vfxRadius; x <= vfxX + vfxRadius; x++) {
      for (let y = vfxY - vfxRadius; y <= vfxY + vfxRadius; y++) {
        try {
          const sprite = this.add.sprite(
            32 + x * 64,
            32 + y * 64,
            'Effects',
            vfx,
          );

          sprite.depth = 100;

          setTimeout(() => {
            sprite.destroy();
          }, vfxTimeout ?? 2000);
        } catch {}
      }
    }
  }

  private goldSpriteForLocation(x: number, y: number) {
    const checkTile = (checkX: number, checkY: number) =>
      get(this.ground, [checkX, checkY, ItemClass.Coin], []).length > 0 &&
      this.canCreateItemSpriteAt(checkX, checkY);

    if (!checkTile(x, y)) return 0;

    const goldDirections = positionSurrounding().reduce(
      (combinedDirections, tileOffset) =>
        checkTile(x + tileOffset.x, y + tileOffset.y)
          ? combinedDirections | tileOffset.direction
          : combinedDirections,
      Direction.Center,
    );

    return spriteTerrainForDirection(336, goldDirections);
  }
}
