import type { Parser } from 'muud';

import { hasCurrency, loseCurrency } from '@lotr/currency';
import {
  Currency,
  GameServerResponse,
  type IAIBehavior,
  type IDialogChatAction,
  type INPC,
  type IServerGame,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { transmissionSendResponseToAccount } from '../../transmission';

export class EventPlannerBehavior implements IAIBehavior {
  init(game: IServerGame, npc: INPC, parser: Parser) {
    const allFestivals = [
      {
        name: '2x XP Festival',
        action: 'goldxp',
        cost: 250_000_000,
        festival: {
          name: 'Gold XP Festival',
          stats: { xpBonusPercent: 100 },
        },
      },
      {
        name: '2x Skill Festival',
        action: 'goldskill',
        cost: 250_000_000,
        festival: {
          name: 'Gold Skill Festival',
          stats: { skillBonusPercent: 100 },
        },
      },
      {
        name: '2x Spawn Festival',
        action: 'goldspawn',
        cost: 250_000_000,
        festival: {
          name: 'Gold Spawn Festival',
          stats: { spawnTickMultiplierBoost: 1 },
        },
      },
    ];

    try {
      parser
        .addCommand('hello')
        .setSyntax(['hello'])
        .setLogic(async ({ env }) => {
          const player = env?.player;
          if (!player) return 'You do not exist.';

          if (distanceFrom(player, npc) > 0) return 'Please come closer.';

          const message = `Glub glub (That's snailese for 'hello, adventurer')!
          Glub glub (That's snailese for 'can I help you with your finances')?`;

          const formattedChat: IDialogChatAction = {
            message,
            displayTitle: npc.name,
            displayNPCName: npc.name,
            displayNPCSprite: npc.sprite,
            displayNPCUUID: npc.uuid,
            options: [
              ...allFestivals.map((festivalData) => ({
                text: `${festivalData.name} (${festivalData.cost.toLocaleString()}g)`,
                action: festivalData.action,
              })),
              { text: 'Leave', action: 'noop' },
            ],
          };

          transmissionSendResponseToAccount(
            player.username,
            GameServerResponse.DialogChat,
            formattedChat,
          );

          return message;
        });
    } catch {}

    allFestivals.forEach((festivalData) => {
      parser
        .addCommand(festivalData.action)
        .setSyntax([festivalData.action])
        .setLogic(async ({ env }) => {
          const player = env?.player;
          if (!player) return 'You do not exist.';

          if (distanceFrom(player, npc) > 0) return 'Please come closer.';

          if (!hasCurrency(player, festivalData.cost, Currency.Gold)) {
            return 'You do not have enough gold!';
          }

          loseCurrency(player, festivalData.cost, Currency.Gold);

          game.dynamicEventHelper.startFestival(player, festivalData.festival);

          return 'There you go!';
        });
    });
  }

  public tick() {}
}
