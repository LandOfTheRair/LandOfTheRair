import type { Database } from '../helpers';

export class LogsRoute {

  static setup(fastify: any, { database }: { database: Database }) {

    const entries = database.getCollectionByName('log-entry');

    fastify.all('/debug/logs/all', async (req, res) => {

      const args = req.query.search ? { message: { $regex: req.query.search, $options: 'si' } } : {};
      const search = await entries.find(args).toArray();
      res.send(search.reverse());
    });
  }

}
