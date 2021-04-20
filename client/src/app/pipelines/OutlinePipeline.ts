export class OutlinePipeline extends Phaser.Renderer.WebGL.Pipelines
  .TextureTintPipeline {

  public static readonly KEY = 'Outline';

  constructor(game: Phaser.Game) {
    super({
      game,
      renderer: game.renderer,
      fragShader: `
      precision highp float;
      uniform sampler2D uMainSampler;
      varying vec2 outTexCoord;
      uniform vec2 uTextureSize;

      void outline( out vec4 fragColor)
      {
        vec4 color = texture2D(uMainSampler, outTexCoord);
        vec2 onePixel = vec2(1.0, 1.0) / uTextureSize;
        vec4 colorU = texture2D(uMainSampler, vec2(outTexCoord.x, outTexCoord.y - onePixel.y));
        vec4 colorD = texture2D(uMainSampler, vec2(outTexCoord.x, outTexCoord.y + onePixel.y));
        vec4 colorL = texture2D(uMainSampler, vec2(outTexCoord.x + onePixel.x, outTexCoord.y));
        vec4 colorR = texture2D(uMainSampler, vec2(outTexCoord.x - onePixel.x, outTexCoord.y));
        vec2 spritesheetPixel = outTexCoord / onePixel;
        vec2 spritePixel = vec2(floor(mod(spritesheetPixel.x, 64.0)),floor(mod(spritesheetPixel.y, 64.0)));
        if (spritePixel.x == 0.0) colorL.a = 0.0;
        if (spritePixel.x == 63.0) colorR.a = 0.0;
        if (spritePixel.y == 0.0) colorU.a = 0.0;
        if (spritePixel.y == 63.0) colorD.a = 0.0;
        
        fragColor = color;
        
        if (color.a == 1.0 && (colorU.a == 0.0 || colorD.a == 0.0 || colorL.a == 0.0 || colorR.a == 0.0)) {
          fragColor = vec4(1.0, 0.0, 0.0, .2);
        }
      }

      void main(void) {
        outline(gl_FragColor);
      }
      `
    });
  }
}
