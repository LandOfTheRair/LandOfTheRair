import { get } from 'lodash';

import { GameServerEvent, GameServerResponse } from '@lotr/interfaces';

export class ForceRebootRoute {
  static setup(fastify: any, { sendToGame, broadcast }) {
    fastify.post('/reboot/force', async (req, res) => {
      if (process.env.NODE_ENV === 'production') {
        const secret = process.env.WEBHOOK_SECRET;
        const testSecret = get(req.body, 'secret', '');

        if (secret !== testSecret) return;
      }

      if (req.query.now) {
        sendToGame({
          type: GameServerEvent.ForceRebootLocal,
        });
        return;
      }

      sendToGame({
        type: GameServerEvent.Announce,
        message:
          'The game will be rebooting shortly. All players will be kicked soon.',
      });

      broadcast({
        type: GameServerResponse.SendImportantNotification,
        message:
          'The game will be rebooting shortly. You will be kicked soon to ensure your data gets saved.',
      });

      setTimeout(() => {
        sendToGame({
          type: GameServerEvent.BlockAndKickAll,
        });

        setTimeout(() => {
          sendToGame({
            type: GameServerEvent.ForceReboot,
          });
        }, 5000);
      }, 5000);

      res.send({});
    });
  }
}
