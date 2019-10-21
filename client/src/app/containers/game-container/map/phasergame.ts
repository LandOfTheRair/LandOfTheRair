
const Phaser = (window as any).Phaser;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

}

export class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
  }

  public create() {

  }

  public update() {

  }
}

export class MapRenderGame extends Phaser.Game {
  constructor(config) {
    super(config);
  }
}
