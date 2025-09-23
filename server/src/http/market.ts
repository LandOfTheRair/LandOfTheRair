import { Database } from '../helpers';

export class MarketRoute {
  static setup(fastify: any, { database }: { database: Database }) {
    const listings = database.getCollectionByName('market-listing');
    const pickups = database.getCollectionByName('market-pickup');

    fastify.all('/market/listings/all', async (req, res) => {
      let page = req.query.page ? +req.query.page : 0;
      if (isNaN(page)) page = 0;

      const sorts = {
        mostrecent: { 'listingInfo.listedAt': -1 },
        leastrecent: { 'listingInfo.listedAt': 1 },
        lowtohigh: { 'listingInfo.price': 1 },
        hightolow: { 'listingInfo.price': -1 },
      };

      const sort = sorts[req.query.sort] ?? sorts.mostrecent;

      let filter = req.query.filter || '';
      try {
        filter = filter.split(',').filter(Boolean);
      } catch {
        filter = [];
      }

      const query: any = {};

      if (req.query.search) {
        query.itemId = new RegExp(req.query.search, 'i');
      }

      if (filter.length > 0) {
        query['itemInfo.itemClass'] = { $in: filter };
      }

      const search = await listings
        .find(query)
        .sort(sort)
        .skip(page * 50)
        .limit(50)
        .toArray();
      res.send(search);
    });

    fastify.all('/market/listings/mine', async (req, res) => {
      const myListings = await listings
        .find({ 'listingInfo.seller': req.query.username })
        .sort({ 'listingInfo.listedAt': -1 })
        .toArray();
      res.send(myListings);
    });

    fastify.all('/market/pickups/mine', async (req, res) => {
      const myPickups = await pickups
        .find({ username: req.query.username })
        .toArray();
      res.send(myPickups);
    });
  }
}
