
const Phaser = (window as any).Phaser;

export class PreloadScene extends Phaser.Scene {

  constructor() {
    super({ key: 'PreloadScene' });
  }

  public preload() {

    this.load.crossOrigin = 'anonymous';
    this.load.addListener('progress', (prog) => {
      const pct = Math.floor(prog * 100);
      this.game.observables.loadPercent.next(`Loading... ${pct}%`);
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
    this.game.observables.loadPercent.next('');
    this.scene.start('MapScene');
  }

}
