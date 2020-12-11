import { BUILDVARS } from './_vars';

const buildVersion = BUILDVARS.version.tag || BUILDVARS.version.semverString || BUILDVARS.version.raw || BUILDVARS.version.hash;
const buildDate = new Date();

export const environment = {
  production: true,

  server: {
    ws: 'wss://game.server.rair.land/'
  },

  client: {
    domain: 'play.rair.land',
    protocol: 'https',
    port: 443
  },

  assetHashes: BUILDVARS.hashes,
  version: `${buildVersion} (built on ${buildDate})`
};
