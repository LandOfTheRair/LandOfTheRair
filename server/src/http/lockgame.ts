
import { get } from 'lodash';

import { GameServerEvent } from '../interfaces';


export class LockGameRoute {

  static setup(fastify: any, { sendToGame }) {
    fastify.post('/debug/lockgame', async (req, res) => {

      if (process.env.NODE_ENV === 'production') {
        const secret = process.env.WEBHOOK_SECRET;
        const testSecret = get(req.body, 'secret', '');

        if (secret !== testSecret) return;
      }

      sendToGame({
        type: GameServerEvent.BlockAndKickAll
      });

      res.send({});
    });
  }

}
