export default class GrayPostFXPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    constructor(game)
    {
        super({
            game:game as any,
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            fragShader
        } as any);
    }
}

const fragShader = `
precision lowp float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
void main()
{
    vec4 original = texture2D(uMainSampler, outTexCoord);
    float color = dot(original.rgb, vec3(0.5, 0.5, 0.2));
    gl_FragColor = vec4(color, color, color, original.a);
}
`;
