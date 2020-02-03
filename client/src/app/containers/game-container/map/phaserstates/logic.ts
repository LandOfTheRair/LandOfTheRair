import { get } from 'lodash';
import { Subscription } from 'rxjs';

import { IMapData, IPlayer, MapLayer } from '../../../../../models';
import { basePlayerSprite, basePlayerSwimmingSprite, spriteOffsetForDirection, swimmingSpriteOffsetForDirection } from './_helpers';

const Phaser = (window as any).Phaser;

export class MapScene extends Phaser.Scene {

  // the current map in JSON form
  private allMapData: IMapData;

  private allSprites = {};

  private playerUpdate$: Subscription;
  private player: IPlayer;

  // the currently visible creatures
  // private visibleCreatures = {};

  constructor() {
    super({ key: 'MapScene' });
  }

  private destroy() {
    if (this.playerUpdate$) this.playerUpdate$.unsubscribe();
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

  public updatePlayerSprite(player: IPlayer) {
    const sprite = this.allSprites[player.uuid];
    if (!sprite) return;

    this.updatePlayerSpriteData(sprite, player);
  }

  private createPlayerSprite(player: IPlayer) {
    const spriteGenderBase = basePlayerSprite(player);
    const directionOffset = spriteOffsetForDirection(player.dir);

    const sprite = this.add.sprite(
      this.convertPosition(player.x), this.convertPosition(player.y),
      'Creatures', spriteGenderBase + directionOffset
    );

    this.allSprites[player.uuid] = sprite;

    this.updatePlayerSpriteData(sprite, player);

    return sprite;
  }

  private convertPosition(lowPosition: number, centerOn?: boolean): number {
    return lowPosition * 64 + (centerOn ? 32 : 0);
  }

  private loadObjectLayer(layer) {
    const decorFirstGid = this.allMapData.tiledJSON.tilesets[2].firstgid;
    const wallFirstGid = this.allMapData.tiledJSON.tilesets[1].firstgid;

    // TODO: am I subscribed? check account object to find out!
    const isSubscribed = false;

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

  public create() {
    this.setupMapInteractions();

    const mapData = { ...this.game.observables.map.getValue() };
    const tiledJSON = { ... mapData.tiledJSON };

    tiledJSON.tileWidth = tiledJSON.tilewidth;
    tiledJSON.tileHeight = tiledJSON.tileheight;

    this.allMapData = mapData;

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

    const player = this.game.observables.player.getValue();

    this.cameras.main.centerOn(this.convertPosition(player.x, true), this.convertPosition(player.y, true));

    this.createPlayerSprite(player);

    this.playerUpdate$ = this.game.observables.player.subscribe(updPlayer => {
      this.player = updPlayer;
      this.updatePlayerSprite(updPlayer);
    });

    this.events.on('destroy', () => this.destroy());

    // TODO: adjust if this sprite is visible based on visibility
    // TODO: if sprite is visible but stealthed, set an alpha of 0.7
  }

  public update() {
    if (!this.player) return;
    this.cameras.main.centerOn(this.convertPosition(this.player.x, true), this.convertPosition(this.player.y, true));
  }
}
