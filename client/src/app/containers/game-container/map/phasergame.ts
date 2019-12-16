import { BehaviorSubject, Subscription } from 'rxjs';
import { Allegiance, Direction, IPlayer } from '../../../../models';
import { GameService } from '../../../game.service';
import { SocketService } from '../../../socket.service';

const Phaser = (window as any).Phaser;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public preload() {

    this.load.crossOrigin = 'anonymous';
    this.load.addListener('progress', (prog) => {
      this.game.observables.loadPercent.next(Math.floor(prog * 100));
    });

    const bgms = ['combat', 'town', 'dungeon', 'wilderness'];
    const sfxs = [
      'combat-block-armor', 'combat-block-weapon', 'combat-die', 'combat-hit-melee', 'combat-hit-spell', 'combat-kill', 'combat-miss',
      'combat-special-blunderbuss',
      'env-door-open', 'env-door-close', 'env-stairs',
      'spell-aoe-fire', 'spell-aoe-frost',
      'spell-buff', 'spell-buff-magical', 'spell-buff-physical', 'spell-buff-protection',
      'spell-debuff-give', 'spell-debuff-receive',
      'spell-heal',
      'spell-sight-effect',
      'spell-special-revive', 'spell-special-teleport',
      'spell-conjure',
      'monster-bear', 'monster-bird', 'monster-dragon', 'monster-ghost',
      'monster-rocks', 'monster-skeleton', 'monster-turkey', 'monster-wolf'
    ];

    this.load.spritesheet('Terrain', 'assets/spritesheets/terrain.png', { frameHeight: 64, frameWidth: 64 });
    this.load.spritesheet('Walls', 'assets/spritesheets/walls.png', { frameHeight: 64, frameWidth: 64 });
    this.load.spritesheet('Decor', 'assets/spritesheets/decor.png', { frameHeight: 64, frameWidth: 64 });
    this.load.spritesheet('Swimming', 'assets/spritesheets/swimming.png', { frameHeight: 64, frameWidth: 64 });
    this.load.spritesheet('Creatures', 'assets/spritesheets/creatures.png', { frameHeight: 64, frameWidth: 64 });
    this.load.spritesheet('Items', 'assets/spritesheets/items.png', { frameHeight: 64, frameWidth: 64 });
    this.load.spritesheet('Effects', 'assets/spritesheets/effects.png', { frameHeight: 64, frameWidth: 64 });


    bgms.forEach(bgm => {
      this.load.audio(`bgm-${bgm}`, `assets/bgm/${bgm}.mp3`);
      this.load.audio(`bgm-${bgm}-nostalgia`, `assets/bgm/${bgm}-nostalgia.mp3`);
    });

    sfxs.forEach(sfx => {
      this.load.audio(`sfx-${sfx}`, `assets/sfx/${sfx}.mp3`);
      this.load.audio(`sfx-${sfx}-nostalgia`, `assets/sfx/${sfx}-nostalgia.mp3`);
    });
  }

  public create() {
    this.scene.start('MapScene');
  }

}

export class MapScene extends Phaser.Scene {

  // the current map in JSON form
  private tiledMapData: any;

  private allSprites = {};

  private playerUpdate$: Subscription;

  // the currently visible creatures
  // private visibleCreatures = {};

  constructor() {
    super({ key: 'MapScene' });
  }

  private destroy() {
    if (this.playerUpdate$) this.playerUpdate$.unsubscribe();
  }

  private basePlayerSprite(player: IPlayer) {
    let choices = { male: 725, female: 675 };

    switch (player.allegiance) {
      case Allegiance.Townsfolk:   { choices = { male: 725, female: 675 }; break; }
      case Allegiance.Wilderness:  { choices = { male: 730, female: 680 }; break; }
      case Allegiance.Royalty:     { choices = { male: 735, female: 685 }; break; }
      case Allegiance.Adventurers: { choices = { male: 740, female: 690 }; break; }
      case Allegiance.Underground: { choices = { male: 745, female: 695 }; break; }
      case Allegiance.Pirates:     { choices = { male: 750, female: 700 }; break; }
    }

    return choices[player.gender];
  }

  private basePlayerSwimmingSprite(player: IPlayer) {
    let choices = { male: 6, female: 0 };

    switch (player.allegiance) {
      case Allegiance.Townsfolk:   { choices = { male: 6,  female: 0 }; break; }
      case Allegiance.Wilderness:  { choices = { male: 7,  female: 1 }; break; }
      case Allegiance.Royalty:     { choices = { male: 8,  female: 2 }; break; }
      case Allegiance.Adventurers: { choices = { male: 9,  female: 3 }; break; }
      case Allegiance.Underground: { choices = { male: 10, female: 4 }; break; }
      case Allegiance.Pirates:     { choices = { male: 11, female: 5 }; break; }
    }

    return choices[player.gender];
  }

  private spriteOffsetForDirection(dir: Direction): number {
    switch (dir) {
      case Direction.South:  return 0;
      case Direction.West:   return 1;
      case Direction.East:   return 2;
      case Direction.North:  return 3;
      case Direction.Corpse: return 4;
      default:               return 0;
    }
  }

  private swimmingSpriteOffsetForDirection(dir: Direction): number {
    switch (dir) {
      case Direction.South:  return 60;
      case Direction.West:   return 84;
      case Direction.East:   return 36;
      case Direction.North:  return 12;
      case Direction.Corpse: return 60;
      default:               return 60;
    }
  }

  private updatePlayerSpriteData(sprite, player: IPlayer) {
    let newFrame = 0;
    let newKey = '';

    if (player.swimLevel && player.hp.__current > 0) {
      const baseSprite = this.basePlayerSwimmingSprite(player);
      const dirSpriteDiff = this.swimmingSpriteOffsetForDirection(player.dir);
      newFrame = baseSprite + dirSpriteDiff;
      newKey = 'Swimming';

    } else {
      const baseSprite = this.basePlayerSprite(player);
      const dirSpriteDiff = this.spriteOffsetForDirection(player.dir);
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
    const spriteGenderBase = this.basePlayerSprite(player);
    const directionOffset = this.spriteOffsetForDirection(player.dir);

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
    const decorFirstGid = this.tiledMapData.tilesets[2].firstgid;
    const wallFirstGid = this.tiledMapData.tilesets[1].firstgid;

    // TODO: am I subscribed? check account object to find out!
    const isSubscribed = false;

    layer.objects.forEach(obj => {
      const isWall = obj.gid < decorFirstGid;
      const firstGid = isWall ? wallFirstGid : decorFirstGid;
      const tileSet = isWall ? 'Walls' : 'Decor';

      const sprite = this.add.sprite(obj.x, obj.y - 64, tileSet, obj.gid - firstGid);
      sprite._baseFrame = sprite.frame;

      // if you're not subscribed, some objects are not visible
      if (obj.properties?.subscriberOnly) {
        sprite.visible = isSubscribed;
      }

      // TODO: doors, stairs
    });
  }

  public create() {
    const mapData = { ...this.game.observables.map.getValue() };
    mapData.tileWidth = mapData.tilewidth;
    mapData.tileHeight = mapData.tileheight;

    this.tiledMapData = mapData;

    this.cache.tilemap.add('map', { data: mapData, format: Phaser.Tilemaps.Formats.TILED_JSON });

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
      this.updatePlayerSprite(updPlayer);
    });

    this.events.on('destroy', () => this.destroy());

    // TODO: adjust if this sprite is visible based on visibility
    // TODO: if sprite is visible but stealthed, set an alpha of 0.7
  }

  public update() {

  }
}

export class MapRenderGame extends Phaser.Game {

  constructor(
    config,
    public gameService: GameService,
    public socketService: SocketService,
    public observables: {
      loadPercent: BehaviorSubject<number>,
      player: BehaviorSubject<IPlayer>,
      map: BehaviorSubject<any>
    }
    ) {
    super(config);
  }
}
