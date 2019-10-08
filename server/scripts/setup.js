
const fs = require('fs');
const path = require('path');

const download = require('download-github-repo');
const readdir = require('recursive-readdir');

download('LandOfTheRair/Content', 'content', async () => {

  if(fs.existsSync('content/maps-static')) fs.rmdirSync('content/maps-static');
  fs.mkdirSync('content/maps-static');

  const allMaps = await readdir('content/maps');
  
  allMaps.forEach(map => {
    fs.copyFileSync(map, `content/maps-static/${path.basename(map)}`)
  });
});