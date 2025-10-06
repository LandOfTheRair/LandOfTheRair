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

    const frameSize = { frameHeight: 64, frameWidth: 64 };

    this.load.spritesheet('Terrain', this.game.assetService.terrainUrl, frameSize);
    this.load.spritesheet('TerrainAnimations', this.game.assetService.terrainAnimationsUrl, frameSize);
    this.load.spritesheet('Walls', this.game.assetService.wallsUrl, frameSize);
    this.load.spritesheet('Decor', this.game.assetService.decorUrl, frameSize);
    this.load.spritesheet('DecorAnimations', this.game.assetService.decorAnimationsUrl, frameSize);
    this.load.spritesheet('Swimming', this.game.assetService.swimmingUrl, frameSize);
    this.load.spritesheet('Creatures', this.game.assetService.creaturesUrl, frameSize);
    this.load.spritesheet('Items', this.game.assetService.itemsUrl, frameSize);
    this.load.spritesheet('Effects', this.game.assetService.effectsUrl, frameSize);
  }

  public create() {
    this.game.observables.loadPercent.next('');
    this.scene.start('MapScene');
  }

}
