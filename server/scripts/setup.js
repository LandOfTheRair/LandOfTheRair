
const childProcess = require('child_process');
const fs = require('fs');
const symlinkDir = require('symlink-dir');

const dl = require('download-github-repo');

const dlMods = () => {

  if(fs.existsSync('CommunityMods')) {
    console.info('[Server] Found CommunityMods repo, cleaning out old mods.');
    fs.rmSync('CommunityMods', { recursive: true });
  }

  console.info('[Server] Downloading a non-git copy of CommunityMods.');

  dl('LandOfTheRair/CommunityMods', 'CommunityMods', async () => {});
};

// if the content folder exists, we can symlink it
if(fs.existsSync('../../Content')) {

  console.info('[Server] Found Content repo, creating a symlink to it.');

  symlinkDir('../../Content', 'content')
    .then(() => {
      dl('LandOfTheRair/Assets', 'content/__assets', async () => {
        dlMods();
      });

    });

// if not, we can download and install everything like normal
} else {

  console.info('[Server] No Content repo, downloading a simple non-git copy of it.');

  dl('LandOfTheRair/Content', 'content', async () => {
    childProcess.exec('cd content && npm install --unsafe-perm');

    dl('LandOfTheRair/Assets', 'content/__assets', async () => {
      dlMods();
    });

  });
}
