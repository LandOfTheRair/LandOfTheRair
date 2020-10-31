import { difference, get, setWith } from 'lodash';
import { Subscription } from 'rxjs';

import { IMapData, IPlayer, MapLayer, ObjectType, TilesWithNoFOVUpdate } from '../../../../../interfaces';
import { basePlayerSprite, basePlayerSwimmingSprite, spriteOffsetForDirection, swimmingSpriteOffsetForDirection } from './_helpers';

const Phaser = (window as any).Phaser;

export class MapScene extends Phaser.Scene {

  // the current map in JSON form
  private allMapData: IMapData;

  private layers = {
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
    playerSprites: null,

    fov: null
  };

  private specialRenders = {
    truesight: false,
    eagleeye: false
  };

  private allCharacterSprites = {};
  private fovSprites = {};
  private fovDetailSprites = {};

  private playerUpdate$: Subscription;
  private allPlayersUpdate$: Subscription;
  private player: IPlayer;

  // the currently visible creatures
  // private visibleCreatures = {};

  constructor() {
    super({ key: 'MapScene' });
  }

  private createLayers() {
    Object.keys(this.layers).forEach((layer, index) => {
      this.layers[layer] = this.add.container();
      this.layers[layer].depth = index + 1;
    });
  }

  private createFOV() {
    const blackBitmapData = this.textures.createCanvas('black', 64, 64);
    blackBitmapData.context.fillStyle = 0x000000;
    blackBitmapData.context.fillRect(0, 0, 64, 64);
    blackBitmapData.refresh();

    /*
    const debugBitmapData = this.g.add.bitmapData(64, 64);
    debugBitmapData.ctx.beginPath();
    debugBitmapData.ctx.rect(0, 0, 64, 64);
    debugBitmapData.ctx.fillStyle = '#0f0';
    debugBitmapData.ctx.fill();
    */

    for (let x = -4; x <= 4; x++) {
      for (let y = -4; y <= 4; y++) {
        const dark = this.add.sprite(64 * (x + 4), 64 * (y + 4), blackBitmapData);
        dark.alpha = 0;
        dark.setScrollFactor(0);

        setWith(this.fovSprites, [x, y], dark, Object);
        this.fovSprites[x][y] = dark;
        this.layers.fov.add(dark);

        const dark2 = this.add.sprite(64 * (x + 4), 64 * (y + 4), blackBitmapData);
        dark2.alpha = 0;
        dark2.setScrollFactor(0);

        setWith(this.fovDetailSprites, [x, y], dark2, Object);
        this.layers.fov.add(dark2);
      }
    }
  }

  private updatePlayerSprite(player: IPlayer) {
    const sprite = this.allCharacterSprites[player.uuid];
    if (!sprite) {
      this.createPlayerSprite(player);
      return;
    }

    this.updatePlayerSpriteData(sprite, player);
  }

  private removePlayerSprite(uuid: string) {
    const sprite = this.allCharacterSprites[uuid];
    if (!sprite) return;

    delete this.allCharacterSprites[uuid];
    sprite.destroy();
  }

  private createPlayerSprite(player: IPlayer) {
    const spriteGenderBase = basePlayerSprite(player);
    const directionOffset = spriteOffsetForDirection(player.dir);

    const sprite = this.add.sprite(
      this.convertPosition(player.x), this.convertPosition(player.y),
      'Creatures', spriteGenderBase + directionOffset
    );

    this.layers.playerSprites.add(sprite);

    this.allCharacterSprites[player.uuid] = sprite;

    this.updatePlayerSpriteData(sprite, player);

    return sprite;
  }

  private updateSelf(player: IPlayer) {
    if (!player) return;

    this.updateFOV();
  }

  private shouldRenderXY(x: number, y: number): boolean {
    if (!this.player) return false;

    return get(this.player.fov, [x, y]);
  }

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

  private updateFOV() {

    const isPlayerInGame = this.allCharacterSprites[this.player.uuid];

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

        /*
        if(this.colyseus.game.debugFOVHide) {
          fovSprite.alpha = 0;
          fovSprite2.alpha = 0;
          continue;
        }
        */

        if (!isPlayerInGame) {
          fovSprite.alpha = 1;
          fovSprite2.alpha = 1;
          continue;
        }

        // tile effects
        /* TODO: darkness / darkvision
        if(fovState && this.isDarkAt(x, y)) {
          if(this.isLightAt(x, y)) {
            fovSprite.alpha = 0;
            continue;
          }

          if(this.canDarkSee(x, y)) {
            fovSprite.alpha = 0.5;
            continue;
          }
        }
        */

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

  private convertPosition(lowPosition: number, centerOn?: boolean): number {
    return lowPosition * 64 + (centerOn ? 32 : 0);
  }

  private loadObjectLayer(layer) {
    const decorFirstGid = this.allMapData.tiledJSON.tilesets[2].firstgid;
    const wallFirstGid = this.allMapData.tiledJSON.tilesets[1].firstgid;

    const isSubscribed = this.player.isSubscribed;

    layer.objects.forEach(obj => {
      const isWall = obj.gid < decorFirstGid;
      const firstGid = isWall ? wallFirstGid : decorFirstGid;
      const tileSet = isWall ? 'Walls' : 'Decor';

      const sprite = this.add.sprite(obj.x + 32, obj.y - 32, tileSet, obj.gid - firstGid);
      sprite._baseFrame = sprite.frame;

      // if you're not subscribed, some objects are not visible
      if (obj.properties?.subscriberOnly) {
        sprite.visible = isSubscribed;
      }

      // TODO: doors, stairs
    });
  }

  private setupMapInteractions() {
    this.input.mouse.disableContextMenu();

    this.input.on('pointerdown', ({ worldX, worldY }) => {
      if (this.input.activePointer.rightButtonDown() || !this.player) return;

      const xCoord = Math.floor(worldX / 64);
      const yCoord = Math.floor(worldY / 64);

      // adjust X/Y so they're relative to the player
      const xDiff = xCoord - this.player.x;
      const yDiff = yCoord - this.player.y;

      const possibleInteractable = get(this.allMapData.layerData, [MapLayer.Interactables, xCoord, yCoord]);
      if (possibleInteractable) {
        // check if it's within "interact" range
        if (Math.abs(xDiff) < 2 && Math.abs(yDiff) < 2) {
          this.game.socketService.sendAction({ command: `~interact`, args: `${xDiff} ${yDiff}` });
        }
      }

      if (xDiff === 0 && yDiff === 0) return;

      this.game.socketService.sendAction({ command: `~move`, args: `${xDiff} ${yDiff}` });
    });
  }

  public init(data) {
    this.player = data.player;
  }

  public create() {

    const player = this.game.observables.player.getValue();
    this.player = player;

    // set up map - must happen first
    const mapData = { ...this.game.observables.map.getValue() };
    const tiledJSON = { ... mapData.tiledJSON };

    tiledJSON.tileWidth = tiledJSON.tilewidth;
    tiledJSON.tileHeight = tiledJSON.tileheight;

    this.allMapData = mapData;

    // create some phaser data
    this.createLayers();
    this.createFOV();
    this.setupMapInteractions();

    this.cache.tilemap.add('map', { data: tiledJSON, format: Phaser.Tilemaps.Formats.TILED_JSON });

    const map = this.make.tilemap({ key: 'map' });

    // add tilesets for maps
    map.addTilesetImage('Terrain', 'Terrain');
    map.addTilesetImage('Walls', 'Walls');
    map.addTilesetImage('Decor', 'Decor');

    // create the base 5 layers
    map.createStaticLayer('Terrain', 'Terrain');
    map.createStaticLayer('Floors', 'Terrain');
    map.createStaticLayer('Fluids', 'Terrain');
    map.createStaticLayer('Foliage', 'Decor');
    map.createStaticLayer('Walls', ['Walls', 'Decor']);

    // decor, densedecor, opaquedecor, interactables
    this.loadObjectLayer(map.objects[0]);
    this.loadObjectLayer(map.objects[1]);
    this.loadObjectLayer(map.objects[2]);
    this.loadObjectLayer(map.objects[3]);

    this.cameras.main.centerOn(this.convertPosition(player.x, true), this.convertPosition(player.y, true));

    this.createPlayerSprite(player);

    this.playerUpdate$ = this.game.observables.player.subscribe(updPlayer => {
      this.player = updPlayer;
      this.updatePlayerSprite(updPlayer);
      this.updateSelf(updPlayer);
    });

    this.allPlayersUpdate$ = this.game.observables.allPlayers.subscribe(allPlayers => {
      const curPlayers = Object.keys(this.allCharacterSprites).filter(f => f !== this.player.uuid);
      const newPlayers = Object.keys(allPlayers);

      Object.values(allPlayers).forEach(p => this.updatePlayerSprite(p as IPlayer));

      const diff = difference(curPlayers, newPlayers);
      diff.forEach(p => this.removePlayerSprite(p));
    });

    this.events.on('destroy', () => this.destroy());

    this.game.observables.loadPercent.next(`Welcome to ${player.map}!`);

    setTimeout(() => {
      this.game.observables.loadPercent.next('');
    }, 1000);

    // TODO: adjust if this sprite is visible based on visibility
    // TODO: if sprite is visible but stealthed, set an alpha of 0.7
  }

  public update() {
    if (!this.player) return;
    this.cameras.main.centerOn(this.convertPosition(this.player.x, true), this.convertPosition(this.player.y, true));
    this.updateFOV();
  }

  private destroy() {
    if (this.playerUpdate$) this.playerUpdate$.unsubscribe();
    if (this.allPlayersUpdate$) this.allPlayersUpdate$.unsubscribe();
  }

  private updatePlayerSpriteData(sprite, player: IPlayer) {
    let newFrame = 0;
    let newKey = '';

    if (player.swimLevel && player.hp.__current > 0) {
      const baseSprite = basePlayerSwimmingSprite(player);
      const dirSpriteDiff = swimmingSpriteOffsetForDirection(player.dir);
      newFrame = baseSprite + dirSpriteDiff;
      newKey = 'Swimming';

    } else {
      const baseSprite = basePlayerSprite(player);
      const dirSpriteDiff = spriteOffsetForDirection(player.dir);
      newFrame = baseSprite + dirSpriteDiff;
      newKey = 'Creatures';

    }

    sprite.x = this.convertPosition(player.x, true);
    sprite.y = this.convertPosition(player.y, true);

    if (sprite.key !== newKey) {
      sprite.setTexture(newKey);
    }

    sprite.setFrame(newFrame);
  }
}
