import type { Parser } from 'muud';

import type {
  IAIBehavior,
  IBufferBehavior,
  IDialogChatAction,
  INPC,
} from '@lotr/interfaces';
import { GameServerResponse } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../../../helpers';

export class BufferBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IBufferBehavior) {
    const buffs = game.contentManager.getGameSetting(
      'npcscript',
      'buffer.buffs',
    ) ?? ['Invisibility', 'DarkVision'];
    const duration =
      game.contentManager.getGameSetting('npcscript', 'buffer.duration') ?? 900;

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const allBuffs = buffs.map((buff) => buff.toUpperCase()).join(', ');

        const message = `Greetings, ${player.name}! It is I who can grant unto thee some temporary relief.
        Just tell me one of these spells, and I'll fix you right up: ${allBuffs}.`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            ...buffs.map((buff) => ({
              text: buff,
              action: buff.toLowerCase(),
            })),
            { text: 'Leave', action: 'noop' },
          ],
        };

        game.transmissionHelper.sendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    buffs.forEach((buff) => {
      parser
        .addCommand(buff.toLowerCase())
        .setSyntax([buff.toLowerCase()])
        .setLogic(async ({ env }) => {
          const player = env?.player;
          if (!player) return 'You do not exist.';

          if (distanceFrom(player, npc) > 0) return 'Please come closer.';

          game.effectHelper.addEffect(player, npc, buff, {
            effect: { duration },
          });

          return 'There you go!';
        });
    });
  }

  tick() {}
}
