import { OutlinePipeline } from 'client/src/app/pipelines/OutlinePipeline';
import * as Phaser from 'phaser';
import { MapRenderGame } from '../phasergame';

export class PreloadScene extends Phaser.Scene {

  public game: MapRenderGame;

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

    const frameSize = { frameHeight: 64, frameWidth: 64 };

    this.load.spritesheet('Terrain', this.game.assetService.terrainUrl, frameSize);
    this.load.spritesheet('Walls', this.game.assetService.wallsUrl, frameSize);
    this.load.spritesheet('Decor', this.game.assetService.decorUrl, frameSize);
    this.load.spritesheet('Swimming', this.game.assetService.swimmingUrl, frameSize);
    this.load.spritesheet('Creatures', this.game.assetService.creaturesUrl, frameSize);
    this.load.spritesheet('Items', this.game.assetService.itemsUrl, frameSize);
    this.load.spritesheet('Effects', this.game.assetService.effectsUrl, frameSize);

    bgms.forEach(bgm => {
      this.load.audio(`bgm-${bgm}`, `assets/bgm/${bgm}.mp3`);
      this.load.audio(`bgm-${bgm}-nostalgia`, `assets/bgm/${bgm}-nostalgia.mp3`);
    });

    sfxs.forEach(sfx => {
      this.load.audio(`sfx-${sfx}`, `assets/sfx/${sfx}.mp3`);
      this.load.audio(`sfx-${sfx}-nostalgia`, `assets/sfx/${sfx}-nostalgia.mp3`);
    });
    if (this.game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
      this.game.renderer.addPipeline(
        OutlinePipeline.KEY,
        new OutlinePipeline(this.game)
      );
    }
  }

  public create() {
    this.game.observables.loadPercent.next('');
    this.scene.start('MapScene');
  }

}
