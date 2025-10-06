
console.info('Hashing spritesheet images...');

const md5file = require('md5-file');
const { gitDescribeSync } = require('git-describe');
const fs = require('fs');

const files = ['creatures', 'decor', 'effects', 'items', 'swimming', 'terrain', 'walls', 'items-animations', 'decor-animations', 'terrain-animations'];

const md5hash = {};

files.forEach(file => {
  const md5 = md5file.sync(`${__dirname}/../src/assets/spritesheets/${file}.png`);
  md5hash[file.split('-').join('')] = md5;
});

let gitRev = 'UNCOMMITTED';
try {
  gitRev = gitDescribeSync({
    dirtyMark: false,
    dirtySemver: false
  });
} catch(e) {
  console.error('No git HEAD; default gitRev set.');
}

const allVars = {
  hashes: md5hash,
  version: gitRev
};

const content = `/* eslint-disable */
export const BUILDVARS = ${JSON.stringify(allVars, null, 2)};`;

fs.writeFileSync(`${__dirname}/../src/environments/_vars.ts`, content, 'utf8');
