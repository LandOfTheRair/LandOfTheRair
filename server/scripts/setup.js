
const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');

const download = require('download-github-repo');
const readdir = require('recursive-readdir');

download('LandOfTheRair/Content', 'content', async () => {

  fs.mkdirpSync('content/maps-static');

  const allMaps = await readdir('content/maps');
  
  allMaps.forEach(map => {
    fs.copySync(map, `content/maps-static/${path.basename(map)}`)
  });

  childProcess.exec('cd content && npm install', () => {
    childProcess.exec('cd content && npm run build:all');
  });

});