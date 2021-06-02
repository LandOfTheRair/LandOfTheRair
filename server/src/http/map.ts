
import path from 'path';
import fs from 'fs-extra';
import readdir from 'recursive-readdir';


export class MapRoute {

  static setup(fastify: any) {

    fastify.all('/editor/map', async (req, res) => {

      const allMaps = await readdir('content/maps');

      const map = req.query.map;
      const mapRef = allMaps.find(x => x.includes(map));

      if (!map) return res.send({ maps: allMaps.map(x => path.basename(x, '.json')) });

      const mapData = await fs.readJson(mapRef);

      res.send(mapData);
    });
  }

}
