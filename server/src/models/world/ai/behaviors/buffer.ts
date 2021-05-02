import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { GameServerResponse, IAIBehavior, IBufferBehavior, IDialogChatAction, INPC } from '../../../../interfaces';

export class BufferBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IBufferBehavior) {

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        const message = `Greetings, ${player.name}! It is I who can grant unto thee some temporary relief.
        Just tell me one of these spells, and I'll fix you right up: INVISIBILITY, DARKVISION.`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Invisibility', action: 'invisibility' },
            { text: 'DarkVision', action: 'darkvision' },
            { text: 'Leave', action: 'noop' },
          ]
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return message;
      });

    parser.addCommand('darkvision')
      .setSyntax(['darkvision'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        game.effectHelper.addEffect(player, npc, 'DarkVision', { effect: { duration: 900 } });

        return 'There you go!';
      });

    parser.addCommand('invisibility')
      .setSyntax(['invisibility'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        game.effectHelper.addEffect(player, npc, 'Invisibility', { effect: { duration: 900 } });

        return 'There you go!';
      });
  }

  tick() {}
}
