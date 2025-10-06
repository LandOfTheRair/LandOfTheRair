import { get } from 'lodash';

import { GameServerEvent, GameServerResponse } from '@lotr/interfaces';

export class RebootRoute {
  static setup(fastify: any, { sendToGame, broadcast }) {
    fastify.post('/reboot/start', async (req, res) => {
      if (process.env.NODE_ENV === 'production') {
        const secret = process.env.WEBHOOK_SECRET;
        const testSecret = get(req.body, 'secret', '');

        if (secret !== testSecret) return;
      }

      sendToGame({
        type: GameServerEvent.Announce,
        message:
          'The game just received an update and will be rebooting shortly. All players will be kicked soon.',
      });

      broadcast({
        type: GameServerResponse.SendImportantNotification,
        message:
          'The game just received an update and will be rebooting shortly. You will be kicked soon to ensure your data gets saved.',
      });

      res.send({});
    });
  }
}
