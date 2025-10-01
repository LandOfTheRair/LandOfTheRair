console.info('[Client] Building asset hash...');

const fs = require('fs');
const path = require('path');
const readdir = require('recursive-readdir');
const md5 = require('md5-file');

const dir2 = `${__dirname}/../src/assets/generated`;
if (!fs.existsSync(dir2)) {
  fs.mkdirSync(dir2);
}

const filetypes = ['.mp3', '.webp', '.svg', '.ttf', '.woff', '.woff2', '.eot'];
const allHashes = {};

readdir(`./src/assets`, (err, files) => {
  if (err) {
    console.error('Error reading files:', err);
    return;
  }

  files.forEach((file) => {
    if (
      !filetypes.includes(path.extname(file)) ||
      file.includes('node_modules') ||
      file.includes('favicon')
    )
      return;

    const cleanName = path
      .normalize(file)
      .replace(/\\/g, '/')
      .replace('src/assets/', '')
      .replace('content/__assets/', '');
    allHashes[cleanName] = md5.sync(file);
  });

  fs.writeFileSync(
    `${__dirname}/../src/assets/generated/all-hashes.json`,
    JSON.stringify(allHashes),
  );
});
