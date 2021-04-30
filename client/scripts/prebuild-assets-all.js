
const imagemin = require('imagemin');
const webp = require('imagemin-webp');

const childProcess = require('child_process');
const fs = require('fs');

console.info('[Client] Downloading assets (sfx, bgm, spritesheets, icons, items, npcs)...');

const dl = require('download-github-repo');

const compressImages = async () => {
  await imagemin([
    `./src/assets/spritesheets/*.png`
  ], {
    destination: `./src/assets/spritesheets/`,
    plugins: [
      webp({
        lossless:true
      })
    ]
  });

  console.log('[Client] Done compressing images.');

};

if(fs.existsSync('../../Content')) {
  const symlinkDir = require('symlink-dir');

  console.info('[Client] Found Content repo, creating a symlink to it.');

  symlinkDir('../../Content', 'src/assets/content');

  dl('LandOfTheRair/Assets', 'src/assets', () => {
    compressImages();
  });

} else {
  console.info('[Client] No Content repo, downloading a simple non-git copy of it.');

  dl('LandOfTheRair/Assets', 'src/assets', () => {
    compressImages();

    dl('LandOfTheRair/Content', 'src/assets/content', () => {
      childProcess.exec('cd src/assets/content && npm install --unsafe-perm', () => {
      });
    });
  });
}
