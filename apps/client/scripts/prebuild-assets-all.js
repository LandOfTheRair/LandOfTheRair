const Jimp = require('jimp');
const imagemin = require('imagemin');
const webp = require('imagemin-webp');

const childProcess = require('child_process');
const fs = require('fs');

console.info(
  '[Client] Downloading assets (sfx, bgm, spritesheets, icons, items, npcs)...',
);

const dl = require('download-github-repo');

const compressImages = async () => {
  await imagemin([`./src/assets/spritesheets/*.png`], {
    destination: `./src/assets/spritesheets/`,
    plugins: [
      webp({
        lossless: true,
      }),
    ],
  });

  console.log('[Client] Done compressing images.');
};

const createSpritesheets = async () => {
  const widths = {
    creatures: 40,
    decor: 40,
    items: 32,
    effects: 8,
    swimming: 12,
    terrain: 24,
    walls: 16,
    'items-animations': 4,
    'decor-animations': 4,
    'terrain-animations': 4,
  };

  await Promise.all(
    Object.keys(widths).map(async (spritegroup) => {
      const files = fs.readdirSync(`./src/assets/spritesheets/${spritegroup}`);
      const width = widths[spritegroup];
      const height = Math.ceil(files.length / width);

      let curCol = 0;
      let curRow = 0;

      const allFileImages = await Promise.all(
        files
          .filter((x) => x.includes('.png'))
          .map((x) => {
            return Jimp.read(`./src/assets/spritesheets/${spritegroup}/${x}`);
          }),
      );

      const spritesheet = new Jimp(64 * width, 64 * height);
      const finalImage = allFileImages.reduce((prev, cur) => {
        const newImg = prev.blit(cur, curCol * 64, curRow * 64);

        curCol++;
        if (curCol === width) {
          curCol = 0;
          curRow++;
        }

        return newImg;
      }, spritesheet);

      await finalImage
        .quality(100)
        .writeAsync(`./src/assets/spritesheets/${spritegroup}.png`);
    }),
  );
};

if (fs.existsSync('../../../Content')) {
  const symlinkDir = require('symlink-dir');

  console.info('[Client] Found Content repo, creating a symlink to it.');

  symlinkDir('../../../Content', 'src/assets/content');

  dl('LandOfTheRair/Assets', 'src/assets', async () => {
    await createSpritesheets();
    await compressImages();
  });
} else {
  console.info(
    '[Client] No Content repo, downloading a simple non-git copy of it.',
  );

  dl('LandOfTheRair/Assets', 'src/assets', async () => {
    await createSpritesheets();
    await compressImages();

    dl('LandOfTheRair/Content', 'src/assets/content', () => {
      childProcess.exec(
        'cd src/assets/content && npm install --unsafe-perm',
        () => {},
      );
    });
  });
}
