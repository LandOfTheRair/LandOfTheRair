import { get } from 'lodash';

import { GameServerEvent } from '@lotr/interfaces';

export class LockGameRoute {
  static setup(fastify: any, { sendToGame }) {
    fastify.post('/reboot/lockgame', async (req, res) => {
      if (process.env.NODE_ENV === 'production') {
        const secret = process.env.WEBHOOK_SECRET;
        const testSecret = get(req.body, 'secret', '');

        if (secret !== testSecret) return;
      }

      sendToGame({
        type: GameServerEvent.BlockAndKickAll,
      });

      res.send({});
    });
  }
}
