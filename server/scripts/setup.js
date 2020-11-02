
const childProcess = require('child_process');
const fs = require('fs');
const symlinkDir = require('symlink-dir');

const dl = require('download-github-repo');

// if the content folder exists, we can symlink it
if(fs.existsSync('../../Content')) {
  
  console.log('[Server] Found Content repo, creating a symlink to it.');

  symlinkDir('../../Content', 'content')
    .then(() => {
      dl('LandOfTheRair/Assets', 'content/__assets', async () => {});
    });

// if not, we can download and install everything like normal
} else {
  
  console.log('[Server] No Content repo, downloading a simple non-git copy of it.');

  dl('LandOfTheRair/Content', 'content', async () => {
    childProcess.exec('cd content && npm install');
  
    dl('LandOfTheRair/Assets', 'content/__assets', async () => {});
  
  });
}