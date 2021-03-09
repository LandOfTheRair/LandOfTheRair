
import { get } from 'lodash';

import { GameAction, GameServerResponse } from '../interfaces';


export class RebootRoute {

  static setup(fastify: any, { broadcast }) {
    fastify.post('/debug/reboot', async (req, res) => {

      if (process.env.NODE_ENV === 'production') {
        const secret = process.env.WEBHOOK_SECRET;
        const testSecret = get(req.body, 'secret', '');

        if (secret !== testSecret) return;
      }

      broadcast({
        action: GameAction.ChatAddMessage,
        timestamp: Date.now(),
        message: 'The game just received an update and will be rebooting shortly. You will be kicked soon to ensure your data gets saved.',
        from: '★System'
      });

      broadcast({
        type: GameServerResponse.SendImportantNotification,
        message: 'The game just received an update and will be rebooting shortly. You will be kicked soon to ensure your data gets saved.'
      });

      res.send({});
    });
  }

}
