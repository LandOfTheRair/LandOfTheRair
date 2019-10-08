
console.log('Downloading assets (sfx, bgm, spritesheets, icons)...');

const dl = require('download-github-repo');
dl('LandOfTheRair/Assets', 'src/assets', () => {});