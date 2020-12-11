import { difference, get, setWith, size } from 'lodash';
import { Subscription } from 'rxjs';

import { basePlayerSprite, basePlayerSwimmingSprite, ICharacter, IMapData, INPC,
  IPlayer, ISimpleItem, ItemClass, MapLayer,
  ObjectType, spriteOffsetForDirection, Stat, swimmingSpriteOffsetForDirection, TilesWithNoFOVUpdate } from '../../../../../interfaces';
import { TrueSightMap, TrueSightMapReversed, VerticalDoorGids } from '../tileconversionmaps';

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
    npcSprites: null,
    characterSprites: null,

    fov: null
  };

  private specialRenders = {
    truesight: false,
    eagleeye: false
  };

  private allNPCSprites = {};
  private allPlayerSprites = {};
  private fovSprites = {};
  private fovDetailSprites = {};
  private visibleItemSprites = {};
  private visibleItemUUIDHash = {};
  private goldSprites = {};

  private playerUpdate$: Subscription;
  private allPlayersUpdate$: Subscription;
  private allNPCsUpdate$: Subscription;
  private openDoorsUpdate$: Subscription;
  private groundUpdate$: Subscription;
  private player: IPlayer;

  private isReady: boolean;

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
    if(this.textures.exists('black')) {
      this.textures.remove('black');
    }

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

  // npc sprite stuff
  private updateNPCSprite(npc: INPC) {
    if(!this.isReady) return;

    const sprite = this.allNPCSprites[npc.uuid];
    if (!sprite) {
      this.createNPCSprite(npc);
      return;
  }

    const directionOffset = spriteOffsetForDirection(npc.dir);
    const newFrame = npc.sprite + directionOffset;

    sprite.setFrame(newFrame);

    this.updateSpritePositionalData(sprite, npc);

    this.stealthUpdate(sprite, npc);
  }

  private removeNPCSprite(uuid: string) {
    const sprite = this.allNPCSprites[uuid];
    if (!sprite) return;

    delete this.allNPCSprites[uuid];
    sprite.destroy();
  }

  private createNPCSprite(npc: INPC) {
    if(!this.isReady) return;

    const sprite = this.add.sprite(
      this.convertPosition(npc.x), this.convertPosition(npc.y),
      'Creatures', npc.sprite
    );

    const directionOffset = spriteOffsetForDirection(npc.dir);
    const newFrame = npc.sprite + directionOffset;

    sprite.setFrame(newFrame);

    this.layers.npcSprites.add(sprite);

    this.allNPCSprites[npc.uuid] = sprite;

    this.updateSpritePositionalData(sprite, npc);

    return sprite;
  }

  // player sprite stuff
  private updatePlayerSprite(player: IPlayer) {
    if(!this.isReady) return;

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
    if(!this.isReady) return;

    const spriteGenderBase = basePlayerSprite(player);
    const directionOffset = spriteOffsetForDirection(player.dir);

    const sprite = this.add.sprite(
      this.convertPosition(player.x), this.convertPosition(player.y),
      'Creatures', spriteGenderBase + directionOffset
    );

    this.layers.characterSprites.add(sprite);

    this.allPlayerSprites[player.uuid] = sprite;

    this.updatePlayerSpriteData(sprite, player);

    return sprite;
  }

  private updateSelf(player: IPlayer) {
    if (!player) return;

    this.updateFOV();
  }

  // whether we see fov at an x,y
  private shouldRenderXY(x: number, y: number): boolean {
    if (!this.player) return false;

    return get(this.player.fov, [x, y]);
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

  private loadObjectLayer(layer, layerGroup) {
    const decorFirstGid = this.allMapData.tiledJSON.tilesets[2].firstgid;
    const wallFirstGid = this.allMapData.tiledJSON.tilesets[1].firstgid;

    const isSubscribed = this.player.isSubscribed;

    layer.objects.forEach(obj => {
      const isWall = obj.gid < decorFirstGid;
      const firstGid = isWall ? wallFirstGid : decorFirstGid;
      const tileSet = isWall ? 'Walls' : 'Decor';

      const sprite = this.add.sprite(obj.x + 32, obj.y - 32, tileSet, obj.gid - firstGid);
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
        sprite._closedFrame = sprite._baseFrame;
        sprite._openFrame = sprite._baseFrame + 1;

        if (VerticalDoorGids[sprite._baseFrame]) {
          const doorTopSprite = this.add.sprite(obj.x + 32, obj.y - 96, tileSet, obj.gid - firstGid + 2);
          doorTopSprite.visible = false;
          sprite._doorTopSprite = doorTopSprite;

          layerGroup.add(doorTopSprite);
        }
      }

      layerGroup.add(sprite);
    });
  }

  // create sprite click functionality for stairs, doors, etc
  private setupMapInteractions() {
    this.input.mouse.disableContextMenu();

    this.input.on('pointerdown', ({ worldX, worldY }) => {
      if (this.input.activePointer.rightButtonDown() || !this.player) return;

      const xCoord = Math.floor(worldX / 64);
      const yCoord = Math.floor(worldY / 64);

      // adjust X/Y so they're relative to the player
      const xDiff = xCoord - this.player.x;
      const yDiff = yCoord - this.player.y;

      const doMove = () => {
        this.game.socketService.sendAction({ command: `~move`, args: `${xDiff} ${yDiff}` });
      };

      const possibleInteractable = get(this.allMapData.layerData, [MapLayer.Interactables, xCoord, yCoord]);
      if (possibleInteractable) {

        if (['Fall', 'Teleport'].includes(possibleInteractable.type)) return doMove();

        // check for a stairs interactable
        if (['StairsUp', 'StairsDown'].includes(possibleInteractable.type) && Math.abs(xDiff) === 0 && Math.abs(yDiff) === 0) {
          this.game.gameService.sendCommandString('~up');

        // check for a climbable interactable
        } else if (['ClimbUp', 'ClimbDown'].includes(possibleInteractable.type) && Math.abs(xDiff) === 0 && Math.abs(yDiff) === 0) {
          this.game.gameService.sendCommandString('~climbup');

        // check if it's within "interact" range for generic interactables
        } else if (Math.abs(xDiff) < 2 && Math.abs(yDiff) < 2) {
          this.game.gameService.sendCommandString(`!interact ${xDiff} ${yDiff}`); // interact is instant because it runs other commands, but fast, so this avoids double queuing
        }
      }

      if (xDiff === 0 && yDiff === 0) return;

      doMove();
    });
  }

  public init(data) {
    this.isReady = false;
    this.player = data.player;
  }

  public create() {
    this.isReady = true;

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
    this.loadObjectLayer(map.objects[0], this.layers.decor);
    this.loadObjectLayer(map.objects[1], this.layers.densedecor);
    this.loadObjectLayer(map.objects[2], this.layers.opaquedecor);
    this.loadObjectLayer(map.objects[3], this.layers.interactables);

    // start the camera at our x,y
    this.cameras.main.centerOn(this.convertPosition(player.x, true), this.convertPosition(player.y, true));

    this.createPlayerSprite(player);

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

    // update the loader as we load the map
    let text = `Welcome to ${player.map}!`;
    if (tiledJSON.properties.creator) {
      text = `${text}<br><small><em>Created by ${tiledJSON.properties.creator}</em></small>`;
    }
    this.game.observables.loadPercent.next(text);
    this.game.observables.hideMap.next(false);

    setTimeout(() => {
      this.game.observables.loadPercent.next('');
    }, 1000);

    // force a move 0,0 to get default rendering info
    setTimeout(() => {
      this.game.gameService.sendCommandString('!move 0 0');
    }, 1000);
  }

  public update() {
    if (!this.player) return;
    this.cameras.main.centerOn(this.convertPosition(this.player.x, true), this.convertPosition(this.player.y, true));
    this.updateFOV();
    this.updateDoors();
  }

  private destroy() {
    if (this.playerUpdate$) this.playerUpdate$.unsubscribe();
    if (this.allPlayersUpdate$) this.allPlayersUpdate$.unsubscribe();
    if (this.allNPCsUpdate$) this.allNPCsUpdate$.unsubscribe();
    if (this.openDoorsUpdate$) this.openDoorsUpdate$.unsubscribe();
    if (this.groundUpdate$) this.groundUpdate$.unsubscribe();
  }

  // set stealth on a character. if we can see it and they have stealth set they're hiding, but not well
  private stealthUpdate(sprite, character: ICharacter) {
    if(character.hp.current <= 0) return;

    sprite.alpha = (character.totalStats?.[Stat.Stealth] ?? 0) ? 0.7 : 1;
  }

  // sprite updates
  private updatePlayerSpriteData(sprite, player: IPlayer) {
    let newFrame = 0;
    let newKey = '';

    if (player.swimLevel && player.hp.current > 0) {
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

    this.updateSpritePositionalData(sprite, player);

    if (sprite.key !== newKey) {
      sprite.setTexture(newKey);
    }

    sprite.setFrame(newFrame);

    sprite.alpha = player.hp.current <= 0 ? 0 : 1;

    this.stealthUpdate(sprite, player);
  }

  private updateSpritePositionalData(sprite, char: ICharacter) {
    sprite.x = this.convertPosition(char.x, true);
    sprite.y = this.convertPosition(char.y, true);
  }

  // truesight functions
  private checkTruesight(player: IPlayer) {
    const hasTruesight = player.effects.buff.find(x => x.effectName === 'TrueSight');

    if (this.specialRenders.truesight && !hasTruesight) {
      this.handleTruesight(false);
    }

    if (!this.specialRenders.truesight && hasTruesight) {
      this.handleTruesight(true);
    }
  }

  private handleTruesight(canSeeTruesight: boolean) {
    this.specialRenders.truesight = canSeeTruesight;

    this.layers.opaquedecor.each(sprite => {
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

        const numItemsHere = size(itemsXY);
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
    const sprite = this.add.sprite(32 + (x * 64), 32 + (y * 64), spritesheet, itemSpriteNumber);
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

    const sprite = this.add.sprite(32 + (x * 64), 32 + (y * 64), 'Terrain', spritePos);
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

  private goldSpriteForLocation(x: number, y: number) {
    const hasGold = (checkX, checkY) => get(this.ground, [checkX, checkY, ItemClass.Coin], false);

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
