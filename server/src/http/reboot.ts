
import { get } from 'lodash';

import { GameAction, GameServerResponse } from '../interfaces';


export class RebootRoute {

  static setup(fastify: any, { broadcast }) {
    fastify.post('/debug/reboot', async (req) => {

      if (process.env.NODE_ENV === 'production') {
        const secret = process.env.WEBHOOK_SECRET;
        const testSecret = get(req.body, 'secret', '');

        if (secret !== testSecret) return;
      }

      broadcast({
        action: GameAction.ChatAddMessage,
        timestamp: Date.now(),
        message: 'The game just received an update and will be rebooting shortly, please exit the game to ensure your data is saved!',
        from: '★System'
      });

      broadcast({
        type: GameServerResponse.SendImportantNotification,
        message: 'The game just received an update and will be rebooting shortly, please exit the game to ensure your data is saved!'
      });
    });
  }

}
