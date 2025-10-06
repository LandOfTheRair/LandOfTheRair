const fs = require('fs');

console.info('[Client] Building modkit metadata...');

const numItemSprites = fs.readdirSync(
  `${__dirname}/../src/assets/spritesheets/items`,
).length;
const numCreatureSprites = fs.readdirSync(
  `${__dirname}/../src/assets/spritesheets/creatures`,
).length;

const modkitMeta = {
  numItemSprites,
  numCreatureSprites,
};

fs.writeFileSync(
  `${__dirname}/../src/assets/generated/modkit-meta.json`,
  JSON.stringify(modkitMeta),
);
