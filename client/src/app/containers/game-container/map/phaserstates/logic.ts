/* eslint-disable no-underscore-dangle */
import { cloneDeep, difference, get, setWith } from 'lodash';
import { Subscription } from 'rxjs';
import * as Phaser from 'phaser';
import {
  basePlayerSprite, FOVVisibility, ICharacter, IMapData, INPC,
  IPlayer, ISimpleItem, ItemClass, MapLayer, ObjectType,
  spriteOffsetForDirection, Stat, TilesWithNoFOVUpdate, doesWallConnect,
  getTerrainSetNumber, Direction, positionWorldXYToTile, positionSubtract, positionText,
  positionIsZero, positionDistanceFromZero } from '../../../../../interfaces';
import { MapRenderGame } from '../phasergame';
import { TrueSightMap, TrueSightMapReversed, VerticalDoorGids } from '../tileconversionmaps';
import OutlinePipeline from '../../../../pipelines/OutlinePipeline';
import Sprite = Phaser.GameObjects.Sprite;

export class MapScene extends Phaser.Scene {

  // the current map in JSON form
  private allMapData: IMapData;
  public game: MapRenderGame;
  private layers: Record<string, Phaser.GameObjects.Container> = {
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

    fov: null
  };

  private specialRenders = {
    truesight: false,
    eagleeye: false
  };

  private firstCreate = true;
  private tilemap: Phaser.Tilemaps.Tilemap;
  private allNPCSprites = {};
  private allPlayerSprites = {};
  private fovSprites = {};
  private fovDetailSprites = {};
  private visibleItemSprites = {};
  private visibleItemUUIDHash = {};
  private goldSprites = {};

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
        const dark = this.add.sprite(64 * (x + 4), 64 * (y + 4), blackBitmapData as any);
        dark.alpha = 0;
        dark.setScrollFactor(0);

        setWith(this.fovSprites, [x, y], dark, Object);
        this.fovSprites[x][y] = dark;
        this.layers.fov.add(dark);

        const dark2 = this.add.sprite(64 * (x + 4), 64 * (y + 4), blackBitmapData as any);
        dark2.alpha = 0;
        dark2.setScrollFactor(0);

        setWith(this.fovDetailSprites, [x, y], dark2, Object);
        this.layers.fov.add(dark2);
      }
    }
  }

  // npc sprite stuff
  private updateNPCSprite(npc: INPC) {
    if (!this.isReady) return;

    const directionOffset = spriteOffsetForDirection(npc.dir);
    const newFrame = npc.sprite + directionOffset;

    let sprite = this.allNPCSprites[npc.uuid];
    if (!sprite) {
      sprite = this.add.sprite(0, 0, 'Creatures', newFrame);
      sprite.setPipeline('OutlinePipeline');
      this.layers.npcSprites.add(sprite);
      this.allNPCSprites[npc.uuid] = sprite;
    } else {
      sprite.setFrame(newFrame);
    }

    if (npc.dir === Direction.Center) {
      sprite.alpha = 0;
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

  private setOutline(uuid: string, color: Array<number>) {
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
    const directionOffset = spriteOffsetForDirection(player.dir);

    const sprite = this.add.sprite(
      this.convertPosition(player.x), this.convertPosition(player.y),
      'Creatures', spriteGenderBase + directionOffset
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

  // whether we see fov at an x,y
  private shouldRenderXY(x: number, y: number): boolean {
    if (!this.player) return false;

    return get(this.player.fov, [x, y]) >= FOVVisibility.CanSee;
  }

  // check if there's a wall at a location (used to render fov for hidden areas)
  private isThereAWallAt(x: number, y: number): boolean {
    if (!this.player) return false;

    const map = this.allMapData.tiledJSON;
    const { width, layers } = map;

    const totalX = x + this.player.x;
    const totalY = y + this.player.y;

    const potentialSecretWall = get(this.allMapData.layerData[MapLayer.OpaqueDecor], [totalX, totalY]);
    const wallList = layers[MapLayer.Walls].data || layers[MapLayer.Walls].tileIds;
    const wallLayerTile = wallList[(width * totalY) + totalX];

    return (potentialSecretWall?.type === ObjectType.SecretWall && !this.specialRenders.truesight)
        || (wallLayerTile !== TilesWithNoFOVUpdate.Empty && wallLayerTile !== TilesWithNoFOVUpdate.Air);
  }

  // update the fov sprites whenever we get new fov
  private updateFOV() {

    const isPlayerInGame = this.allPlayerSprites[this.player.uuid];

    for (let x = -4; x <= 4; x++) {
      for (let y = -4; y <= 4; y++) {
        const fovState = this.shouldRenderXY(x, y);
        const fovSprite = this.fovSprites[x][y];
        const fovSprite2 = this.fovDetailSprites[x][y];

        fovSprite.setScale(1);
        fovSprite.x = 32 + 64 * (x + 4);
        fovSprite.y = 32 + 64 * (y + 4);

        fovSprite2.setScale(1);
        fovSprite2.x = 32 + 64 * (x + 4);
        fovSprite2.y = 32 + 64 * (y + 4);

        if (!isPlayerInGame) {
          fovSprite.alpha = 1;
          fovSprite2.alpha = 1;
          continue;
        }

        // tile effects
        if (fovState && this.canSeeThroughDarkAt(x, y)) {
          fovSprite.alpha = 0.5;
          fovSprite2.alpha = 0.5;
          continue;
        }

        fovSprite.alpha = fovState ? 0 : 1;
        fovSprite2.alpha = fovState ? 0 : 1;

        // cut tiles
        if (fovState) {
          const isWallHere = this.isThereAWallAt(x, y);
          if (!isWallHere) continue;

          // FOV SPRITE 2 IS USED HERE SO IT CAN LAYER ON TOP OF THE OTHER ONES
          if (y === 4                                           // cut down IIF the wall *is* the edge tile (scale down to y0.5, y + ~32)
          || (y + 1 <= 4 && !this.shouldRenderXY(x, y + 1))) {  // cut down (scale down to y0.5, y + ~32)

            fovSprite2.alpha = 1;
            fovSprite2.setScale(1, 0.7);
            fovSprite2.y += 20;
          }

          if (x === -4                                          // cut left IIF the wall *is* the edge tile (scale down to x0.5, no offset)
          || (x - 1 >= -4 && !this.shouldRenderXY(x - 1, y))) { // cut left (scale down to x0.5, no offset)

            // if the tile is black on both sides, it should be black regardless
            if (!this.shouldRenderXY(x + 1, y)) {
              fovSprite.alpha = 1;
              continue;
            }

            fovSprite.alpha = 1;
            fovSprite.setScale(0.35, 1);
            fovSprite.x -= 22;
            continue;
          }


          if (x === 4                                           // cut right IIF the wall *is* the edge tile (scale down to x0.5, x + ~32)
          || (x + 1 <= 4 && !this.shouldRenderXY(x + 1, y))) {  // cut right (scale down to x0.5, x + ~32)

            // if the tile is black on both sides, it should be black regardless
            if (!this.shouldRenderXY(x - 1, y)) {
              fovSprite.alpha = 1;
              continue;
            }

            fovSprite.alpha = 1;
            fovSprite.setScale(0.35, 1);
            fovSprite.x += 42;

          }
        }

      }
    }
  }

  private canSeeThroughDarkAt(x: number, y: number): boolean {
    if (!this.player) return false;
    if (this.player.effects._hash.Blind) return false;

    const darkCheck = get(this.player.fov, [x, y]) === FOVVisibility.CanSeeButDark;
    return darkCheck && !!this.player.effects._hash.DarkVision;
  }

  private updateDoors() {
    this.layers.interactables.each(i => {
      if (i._type !== 'Door') return;
      i.setFrame(this.openDoors[i._id] ? i._openFrame : i._closedFrame);

      if (i._doorTopSprite) {
        i._doorTopSprite.visible = !!this.openDoors[i._id];
      }
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
      getTerrainSetNumber(floor.index - floorIndexOffset);
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
    const walls = map.getTilesWithin(0, 0, map.width, map.height, { isNotEmpty: true }, 'Walls');
    walls.forEach((wall) => {
      const wallIndex = getWallIndex(wall);
      // If this wall extends all the way left, and right, no cut
      if (doesWallConnect(wallIndex, Direction.East) && doesWallConnect(wallIndex, Direction.West)) return;
      // If this wall does not connect up, or down, no cut
      if (!(doesWallConnect(wallIndex, Direction.South) || doesWallConnect(wallIndex, Direction.North))) return;
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
      if (doesWallConnect(wallLeft, Direction.West)) {
        cutRight(floor);
      }
      const wallRight = getWallIndexAt(wall.x - 1, wall.y);
      //If the right wall is trying to connect to us, we can cut the left
      if (doesWallConnect(wallRight, Direction.West)) {
        cutLeft(floor);
      }
    });
  }

  private fixDoorFloor(worldX: number, worldY: number) {
    const floorIndexOffset = this.tilemap.getTileset('Terrain').firstgid;
    const getFloorSet = (floor: Phaser.Tilemaps.Tile) =>
      getTerrainSetNumber(floor.index - floorIndexOffset);
    const getFloorSetAt = (x: number, y: number) =>
      getFloorSet(this.tilemap.getTileAt(x, y, true, 'Floors'));
    const doorFloor = this.tilemap.getTileAtWorldXY(worldX, worldY - 1, false, null, 'Floors');
    if (doorFloor) {
      const floorC = getFloorSet(doorFloor);
      const floorL = getFloorSetAt(doorFloor.x - 1, doorFloor.y);
      const floorR = getFloorSetAt(doorFloor.x + 1, doorFloor.y);;
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


  private loadObjectLayer(layer, layerGroup) {
    const decorFirstGid = this.allMapData.tiledJSON.tilesets[2].firstgid;
    const wallFirstGid = this.allMapData.tiledJSON.tilesets[1].firstgid;

    const isSubscribed = this.player.subscriptionTier > 0;

    layer.objects.forEach(obj => {
      const isWall = obj.gid < decorFirstGid;
      const firstGid = isWall ? wallFirstGid : decorFirstGid;
      const tileSet = isWall ? 'Walls' : 'Decor';

      const sprite = this.add.sprite(obj.x + 32, obj.y - 32, tileSet, obj.gid - firstGid) as any;
      sprite._baseFrame = sprite.frame.name;
      sprite._type = obj.type;
      sprite._id = obj.id;

      // if you're not subscribed, some objects are not visible
      if (obj.properties?.subscriberOnly) {
        sprite.visible = isSubscribed;
      }

      // surprisingly interactables can be interacted with
      if (obj.type === 'StairsUp' || obj.type === 'StairsDown'
       || obj.type === 'ClimbUp' || obj.type === 'ClimbDown'
       || obj.type === 'Door') {
        sprite.inputEnabled = true;
      }

      // vertical doors have to store two sprites, and create a door top
      if (obj.type === 'Door') {
        this.fixDoorFloor(obj.x, obj.y);
        sprite._closedFrame = sprite._baseFrame;
        sprite._openFrame = sprite._baseFrame + 1;

        if (VerticalDoorGids[sprite._baseFrame]) {
          const doorTopSprite = this.add.sprite(obj.x + 32, obj.y - 96, tileSet, obj.gid - firstGid + 2);
          doorTopSprite.visible = false;
          sprite._doorTopSprite = doorTopSprite;

          layerGroup.add(doorTopSprite);
        }
      }

      if (obj.type === 'Door' || obj.type === 'StairsUp' || obj.type === 'StairsDown') {
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
      const playerToClickedOffset = positionSubtract(clickedTilePostion, this.player);

      const doCommand = (command: string) => {
        this.game.socketService.sendAction({ command, args: positionText(playerToClickedOffset) });
      };
      const interactTile = this.allMapData.layerData[MapLayer.Interactables]?.[clickedTilePostion.x]?.[clickedTilePostion.y];
      if (interactTile) {
        switch (interactTile.type) {
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
  }

  public create() {
    if (!this.firstCreate) {
      this.visibleItemSprites = {};
      this.visibleItemUUIDHash = {};
      this.goldSprites = {};
    }
    const player = this.game.observables.player.getValue();
    this.player = player;

    // set up map - must happen first
    const mapData = { ...this.game.observables.map.getValue() };
    const tiledJSON = { ...cloneDeep(mapData.tiledJSON) };

    tiledJSON.tileWidth = tiledJSON.tilewidth;
    tiledJSON.tileHeight = tiledJSON.tileheight;

    this.allMapData = mapData;

    // create some phaser data
    this.createLayers();
    this.createFOV();
    this.setupMapInteractions();

    this.cache.tilemap.add('map', { data: tiledJSON, format: Phaser.Tilemaps.Formats.TILED_JSON });

    const map = this.make.tilemap({ key: 'map' });
    this.tilemap = map;
    // add tilesets for maps
    map.addTilesetImage('Terrain', 'Terrain');
    map.addTilesetImage('Walls', 'Walls');
    map.addTilesetImage('Decor', 'Decor');

    // create the base 5 layers
    map.createLayer('Terrain', ['Decor', 'Terrain']);
    map.createLayer('Floors', ['Decor', 'Terrain']);
    map.createLayer('Fluids', ['Decor', 'Terrain']);
    map.createLayer('Foliage', 'Decor');
    map.createLayer('Walls', ['Walls', 'Decor']);

    this.fixWallFloors(map);

    // decor, densedecor, opaquedecor, interactables
    this.loadObjectLayer(map.objects[0], this.layers.decor);
    this.loadObjectLayer(map.objects[1], this.layers.densedecor);
    this.loadObjectLayer(map.objects[2], this.layers.opaquedecor);
    this.loadObjectLayer(map.objects[3], this.layers.interactables);

    if (this.firstCreate) {
      this.registerEvents();

      // update the loader as we load the map
      let text = `Welcome to ${player.map}!`;
      if (tiledJSON.properties.creator) {
        text = `${text}<br><small><em>Created by ${tiledJSON.properties.creator}</em></small>`;
      }

      if (this.hideWelcome) text = '';

      this.game.observables.loadPercent.next(text);
      setTimeout(() => {
        this.game.observables.loadPercent.next('');
      }, 1000);
    }
    else {
      this.createPlayerSprite(player);
    }

    // start the camera at our x,y
    this.cameras.main.centerOn(this.convertPosition(player.x, true), this.convertPosition(player.y, true));

    this.game.observables.hideMap.next(false);
    setTimeout(() => {
      this.game.gameService.sendCommandString('!move 0 0');
    }, 1000);
    this.updateGroundSprites();
    this.firstCreate = false;
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

    this.currentTarget$ = this.game.observables.target.subscribe(updTarget => {
      this.updateTarget(updTarget);
    });

    // watch for player updates
    this.playerUpdate$ = this.game.observables.player.subscribe(updPlayer => {
      this.player = updPlayer;
      this.updatePlayerSprite(updPlayer);
      this.updateSelf(updPlayer);
      this.checkTruesight(updPlayer);
    });

    // watch for other players to come in
    this.allPlayersUpdate$ = this.game.observables.allPlayers.subscribe(allPlayers => {
      const curPlayers = Object.keys(this.allPlayerSprites).filter(f => f !== this.player.uuid);
      const newPlayers = Object.keys(allPlayers);

      Object.values(allPlayers).forEach(p => this.updatePlayerSprite(p as IPlayer));

      const diff = difference(curPlayers, newPlayers);
      diff.forEach(p => this.removePlayerSprite(p));
    });

    // watch for npcs to come in
    this.allNPCsUpdate$ = this.game.observables.allNPCs.subscribe(allNPCs => {
      const curNPCs = Object.keys(this.allNPCSprites);
      const newNPCs = Object.keys(allNPCs);

      Object.values(allNPCs).forEach((p) => this.updateNPCSprite(p as INPC));

      const diff = difference(curNPCs, newNPCs);
      diff.forEach(p => this.removeNPCSprite(p));
    });

    this.openDoorsUpdate$ = this.game.observables.openDoors.subscribe(openDoors => {
      this.openDoors = openDoors;
    });

    this.groundUpdate$ = this.game.observables.ground.subscribe(ground => {
      this.ground = ground;
      this.removeOldItemSprites();
      this.updateGroundSprites();
    });

    this.events.on('destroy', () => this.destroy());
  }

  public update() {
    if (!this.player) return;
    this.cameras.main.centerOn(this.convertPosition(this.player.x, true), this.convertPosition(this.player.y, true));
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

  // set stealth on a character. if we can see it and they have stealth set they're hiding, but not well
  private stealthUpdate(sprite: Sprite, character: ICharacter) {
    if (character.hp.current <= 0) return;

    sprite.alpha = (character.totalStats?.[Stat.Stealth] ?? 0) ? 0.7 : 1;
  }

  // sprite updates
  private updatePlayerSpriteData(sprite: Sprite, player: IPlayer) {

    const playerFrame = basePlayerSprite(player) + spriteOffsetForDirection(player.dir);
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
    const tileCheck = (char.y * this.allMapData.tiledJSON.width) + char.x;
    const fluid = this.allMapData.tiledJSON.layers[MapLayer.Fluids].data;
    const isSwimming = !!fluid[tileCheck];
    OutlinePipeline.setSwimming(sprite, isSwimming);
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
    return x < centerX - 4 || x > centerX + 4 || y < centerY - 4 || y > centerY + 4;
  }

  // item-render functions
  private canCreateItemSpriteAt(x: number, y: number): boolean {
    const tileCheck = (y * this.allMapData.tiledJSON.width) + x;
    const fluid = this.allMapData.tiledJSON.layers[MapLayer.Fluids].data;
    const foliage = this.allMapData.tiledJSON.layers[MapLayer.Foliage].data;
    return this.specialRenders.eagleeye || (!fluid[tileCheck] && !foliage[tileCheck]);
  }

  private updateGroundSprites() {
    for (let x = this.player.x - 4; x <= this.player.x + 4; x++) {
      const itemsX = this.ground[x];
      if (!itemsX) continue;

      for (let y = this.player.y - 4; y <= this.player.y + 4; y++) {
        const itemsXY = this.ground[x][y];
        if (!itemsXY) continue;

        // Get the number of items on the tile, by summing the amount of items in each array
        const numItemsHere = Object.keys(itemsXY).map((type) => itemsXY[type].length).reduce((a, b) => a + b, 0);

        Object.keys(itemsXY).forEach(itemType => {
          if (itemsXY[itemType].length === 0 || (itemType === ItemClass.Coin && numItemsHere > 1)) {
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
    if (!this.visibleItemSprites[x][y][realItem.itemClass]) this.visibleItemSprites[x][y][realItem.itemClass] = null;

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
    const itemSpriteNumber = isCorpse ? item.mods.sprite : realItem.sprite;
    const sprite = this.add.sprite(32 + (x * 64), 32 + (y * 64), spritesheet, itemSpriteNumber) as any;
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

    const sprite = this.add.sprite(32 + (x * 64), 32 + (y * 64), 'Terrain', spritePos) as any;
    this.goldSprites[x][y] = sprite;

    sprite._realX = x;
    sprite._realY = y;

    this.layers.gold.add(sprite);
  }

  private removeOldItemSprites() {
    this.layers.groundItems.each(sprite => {
      const x = sprite._realX;
      const y = sprite._realY;

      let ground = this.ground[x] ? this.ground[x][y] : null;
      ground = ground || {};

      const myGround = ground[sprite.itemClass] || [];
      if (this.notInRange(this.player.x, this.player.y, x, y) || !myGround || !myGround[0] || myGround[0].item.uuid !== sprite.uuid) {
        delete this.visibleItemUUIDHash[sprite.uuid];
        this.visibleItemSprites[x][y][sprite.itemClass] = null;
        sprite.destroy();
      }
    });

    this.layers.gold.each(sprite => {
      const x = sprite._realX;
      const y = sprite._realY;

      let ground = this.ground[x] ? this.ground[x][y] : null;
      ground = ground || {};

      if (this.notInRange(this.player.x, this.player.y, x, y) || !ground[ItemClass.Coin]) {
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

          const sprite = this.add.sprite(32 + (x * 64), 32 + (y * 64), 'Effects', vfx);

          setTimeout(() => {
            sprite.destroy();
          }, vfxTimeout ?? 2000);

        } catch {}
      }
    }
  }

  private goldSpriteForLocation(x: number, y: number) {
    const hasGold = (checkX: number, checkY: number) => get(this.ground, [checkX, checkY, ItemClass.Coin], []).length > 0;

    // check and abort early
    const goldHere = hasGold(x, y) && this.canCreateItemSpriteAt(x, y);
    if (!goldHere) return 0;
    const goldNW = hasGold(x - 1, y - 1) && this.canCreateItemSpriteAt(x - 1, y - 1);
    const goldN  = hasGold(x,     y - 1) && this.canCreateItemSpriteAt(x,     y - 1);
    const goldNE = hasGold(x + 1, y - 1) && this.canCreateItemSpriteAt(x + 1, y - 1);
    const goldE =  hasGold(x + 1, y)     && this.canCreateItemSpriteAt(x + 1, y);
    const goldSE = hasGold(x + 1, y + 1) && this.canCreateItemSpriteAt(x + 1, y + 1);
    const goldS  = hasGold(x,     y + 1) && this.canCreateItemSpriteAt(x,     y + 1);
    const goldSW = hasGold(x - 1, y + 1) && this.canCreateItemSpriteAt(x - 1, y + 1);
    const goldW  = hasGold(x - 1, y)     && this.canCreateItemSpriteAt(x - 1, y);

    if (!goldNW && goldN && goldNE && goldE && goldSE && goldS && goldSW && goldW) return 337; // NW corner missing
    if (goldNW && goldN && !goldNE && goldE && goldSE && goldS && goldSW && goldW) return 338; // NE corner missing
    if (goldNW && goldN && goldNE && goldE && !goldSE && goldS && goldSW && goldW) return 339; // SE corner missing
    if (goldNW && goldN && goldNE && goldE && goldSE && goldS && !goldSW && goldW) return 340; // SW corner missing

    if (!goldNW && goldN && !goldNE && goldE && goldSE && goldS && goldSW && goldW) return 341;  // NE,NW corner missing
    if (goldNW && goldN && !goldNE && goldE && !goldSE && goldS && goldSW && goldW) return 342;  // NE,SE corner missing
    if (goldNW && goldN && goldNE && goldE && !goldSE && goldS && !goldSW && goldW) return 343;  // SE,SW corner missing
    if (!goldNW && goldN && goldNE && goldE && goldSE && goldS && !goldSW && goldW) return 344;  // SW,NW corner missing

    if (!goldNW && goldN && !goldNE && goldE && goldSE && goldS && !goldSW && goldW) return 345; // NW,NE,SW corner missing
    if (!goldNW && goldN && !goldNE && goldE && !goldSE && goldS && goldSW && goldW) return 346; // NW,NE,SE corner missing
    if (goldNW && goldN && !goldNE && goldE && !goldSE && goldS && !goldSW && goldW) return 347; // NE,SE,SW corner missing
    if (!goldNW && goldN && goldNE && goldE && !goldSE && goldS && !goldSW && goldW) return 348; // NW,SE,SW corner missing

    if (!goldNW && goldN && !goldNE && goldE && !goldSE && goldS && !goldSW && goldW) return 349;  // ALL corner missing

    if (!goldN && goldE && goldSE && goldS && goldSW && goldW) return 350; // N missing NE,NW unchecked
    if (goldNW && goldN && !goldE && goldS && goldSW && goldW) return 351; // E missing NE,SE unchecked
    if (goldNW && goldN && goldNE && goldE && !goldS && goldW) return 352; // S missing SE,SW unchecked
    if (goldN && goldNE && goldE && goldSE && goldS && !goldW) return 353; // W missing SW,NW unchecked

    if (!goldNW && goldN && goldNE && goldE && !goldS && goldW) return 354;  // NW,S missing SE,SW unchecked
    if (goldNW && goldN && !goldNE && goldE && !goldS && goldW) return 355;  // NE,S missing SE,SW unchecked
    if (!goldN && goldE && !goldSE && goldS && goldSW && goldW) return 356;  // SE,N missing NE,NW unchecked
    if (!goldN && goldE && goldSE && goldS && !goldSW && goldW) return 357;  // SW,N missing NE,NW unchecked

    if (!goldNW && goldN && !goldE && goldS && goldSW && goldW) return 358;  // NW,E missing NE,SE unchecked
    if (goldN && !goldNE && goldE && goldSE && goldS && !goldW) return 359;  // NE,W missing NW,SW unchecked
    if (goldN && goldNE && goldE && !goldSE && goldS && !goldW) return 360;  // SE,W missing NW,SW unchecked
    if (goldNW && goldN && !goldE && goldS && !goldSW && goldW) return 361;  // SW,E missing NE,SE unchecked

    if (!goldN && goldE && !goldSE && goldS && !goldSW && goldW) return 362; // SE,SW,N missing NW,NE unchecked
    if (!goldNW && goldN && !goldE && goldS && !goldSW && goldW) return 363; // NW,SW,E missing SE,NE unchecked
    if (!goldNW && goldN && !goldNE && goldE && !goldS && goldW) return 364; // NE,NW,S missing SE,SW unchecked
    if (goldN && !goldNE && goldE && !goldSE && goldS && !goldW) return 365; // NE,SE,W missing NW,SW unchecked

    if (!goldN && goldE && goldSE && goldS && !goldW) return 366; // E,SE,S present, NE,SW,NW unchecked
    if (!goldN && !goldE && goldS && goldSW && goldW) return 367; // W,SW,S present, NW,SE,NE unchecked
    if (goldNW && goldN && !goldE && !goldS && goldW) return 368; // W,NW,N present, NE,SE,SW unchecked
    if (goldN && goldNE && goldE && !goldS && !goldW) return 369; // E,NE,N present, NW,SE,SW unchecked

    if (!goldN && goldE && goldS && !goldW) return 370;  // E,S present, CORNERS unchecked
    if (!goldN && !goldE && goldS && goldW) return 371;  // W,S present, CORNERS unchecked
    if (goldN && !goldE && !goldS && goldW) return 372;  // W,N present, CORNERS unchecked
    if (goldN && goldE && !goldS && !goldW) return 373;  // E,N present, CORNERS unchecked

    if (!goldN && !goldE && goldS && !goldW) return 374; // S present, CORNERS unchecked
    if (!goldN && !goldE && !goldS && goldW) return 375; // W present, CORNERS unchecked
    if (goldN && !goldE && !goldS && !goldW) return 376; // N present, CORNERS unchecked
    if (!goldN && goldE && !goldS && !goldW) return 377; // E present, CORNERS unchecked

    if (goldN && !goldE && goldS && !goldW) return 378;  // N,S present, CORNERS unchecked
    if (!goldN && goldE && !goldS && goldW) return 379;  // E,W present, CORNERS unchecked

    if (!goldNW && goldN && goldNE && goldE && !goldSE && goldS && goldSW && goldW) return 380;  // NW,SE missing
    if (goldNW && goldN && !goldNE && goldE && goldSE && goldS && !goldSW && goldW) return 381;  // NE,SW missing

    if (goldNW && goldN && goldNE && goldE && goldSE && goldS && goldSW && goldW) return 382;  // ALL present

    return 336;
  }
}

