
import fs from 'fs-extra';
import readdir from 'recursive-readdir';

import { IItemDefinition, INPCDefinition } from '../interfaces';

export class ModDataRoute {

  static async setup(fastify: any) {

    // load all the mod data into two vars
    await fs.ensureDir('./content/mods');

    const allItems: IItemDefinition[] = [];
    const allNPCs: INPCDefinition[] = [];

    const modPaths = await readdir('content/mods');
    modPaths.forEach(modPath => {
      const mod = fs.readJSONSync(modPath);

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
