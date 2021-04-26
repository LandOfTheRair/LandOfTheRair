
const childProcess = require('child_process');
const fs = require('fs');

console.info('[Client] Downloading assets (sfx, bgm, spritesheets, icons, items, npcs)...');

const dl = require('download-github-repo');

if(fs.existsSync('../../Content')) {
  const symlinkDir = require('symlink-dir');

  console.info('[Client] Found Content repo, creating a symlink to it.');

  symlinkDir('../../Content', 'src/assets/content');

  dl('LandOfTheRair/Assets', 'src/assets', () => {});

} else {
  console.info('[Client] No Content repo, downloading a simple non-git copy of it.');

  dl('LandOfTheRair/Assets', 'src/assets', () => {
    dl('LandOfTheRair/Content', 'src/assets/content', () => {
      childProcess.exec('cd src/assets/content && npm install --unsafe-perm', () => {
      });
    });
  });
}
