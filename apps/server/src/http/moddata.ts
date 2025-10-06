import fs from 'fs-extra';

import type { IItemDefinition, INPCDefinition } from '@lotr/interfaces';

export class ModDataRoute {
  static async setup(fastify: any) {
    // load all the mod data into two vars
    await fs.ensureDir('./content/mods');

    const allItems: IItemDefinition[] = [];
    const allNPCs: INPCDefinition[] = [];

    const modsToLoad = process.env.MODS_TO_LOAD
      ? (process.env.MODS_TO_LOAD || '').split(',').map((x) => x.trim())
      : [];

    modsToLoad.forEach((modPath) => {
      if (!fs.existsSync(`content/mods/${modPath}.rairmod`)) {
        console.error(
          'NET:Mods',
          `Mod "${modPath}" does not exist, skipping load step for HTTP API...`,
        );
        return;
      }

      const mod = fs.readJSONSync(`content/mods/${modPath}.rairmod`);

      allItems.push(...mod.items);
      allNPCs.push(...mod.npcs);
    });

    fastify.get('/mod/all', async (req, res) => {
      res.send({ items: allItems, npcs: allNPCs });
    });

    fastify.get('/mod/items', async (req, res) => {
      res.send(allItems);
    });

    fastify.get('/mod/npcs', async (req, res) => {
      res.send(allNPCs);
    });
  }
}
