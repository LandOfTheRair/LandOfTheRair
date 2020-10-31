
const childProcess = require('child_process');

const download = require('download-github-repo');

download('LandOfTheRair/Content', 'content', async () => {
  childProcess.exec('cd content && npm install', () => {
    childProcess.exec('cd content && npm run build:all');
  });

  download('LandOfTheRair/Assets', 'content/__assets', async () => {});

});