
const childProcess = require('child_process');

console.log('Downloading assets (sfx, bgm, spritesheets, icons, items, npcs)...');

const dl = require('download-github-repo');
dl('LandOfTheRair/Assets', 'src/assets', () => {
  dl('LandOfTheRair/Content', 'src/assets/content', () => {
    childProcess.exec('cd src/assets/content && npm install', () => {
      childProcess.exec('cd src/assets/content && npm run build:all');
    });
  });
});