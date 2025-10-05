import { Parser } from 'muud';

import { distanceFrom, Game } from '../../../../helpers';
import {
  Currency,
  GameServerResponse,
  IAIBehavior,
  IDialogChatAction,
  INPC,
  IUpgraderBehavior,
} from '../../../../interfaces';

export class GuildClerkBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IUpgraderBehavior) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (!player.guildId) {
          return 'Come back when you have a guild!';
        }

        const message =
          'Hello! I can help you manage various aspects of your guild, like your TREASURY.';

        const options = [
          { text: 'Our Treasury?', action: 'treasury' },
          { text: 'Leave', action: 'noop' },
        ];

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options,
        };

        game.transmissionHelper.sendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('treasury')
      .setSyntax(['treasury'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (!player.guildId) {
          return 'Come back when you have a guild!';
        }

        const message =
          'Yes! I can help you manage your guild funds. I can help you ADD or TAKE funds from your treasury.';

        const options = [
          { text: 'Add Funds', action: 'add' },
          { text: 'Take Funds', action: 'take' },
          { text: 'Leave', action: 'noop' },
        ];

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options,
        };

        game.transmissionHelper.sendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('add')
      .setSyntax(['add'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (!player.guildId) {
          return 'Come back when you have a guild!';
        }

        const message =
          'Tell me how much you would like to ADD to the treasury.';

        env.callbacks?.emit({
          type: GameServerResponse.SendInput,
          title: 'Add to Treasury',
          content: 'How much gold?',
          extraData: { okText: 'Yes, add it!', cancelText: 'No, cancel' },
          okAction: {
            command: `!privatesay`,
            args: `${npc.uuid}, add $value`,
          },
        });

        return message;
      });

    parser
      .addCommand('addamount')
      .setSyntax(['add <string:amount*>'])
      .setLogic(async ({ env, args }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (!player.guildId) {
          return 'Come back when you have a guild!';
        }

        let amount = game.userInputHelper.cleanNumber(args['amount*'], 0, {
          floor: true,
        });
        amount = Math.min(
          amount,
          game.currencyHelper.getCurrency(player, Currency.Gold),
        );
        if (amount <= 0) return 'You cannot deposit that much.';

        game.guildManager.addToTreasury(player, amount);
        game.currencyHelper.loseCurrency(player, amount, Currency.Gold);

        return `I've added ${amount.toLocaleString()} gold to your guild treasury!`;
      });

    parser
      .addCommand('take')
      .setSyntax(['take'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (!player.guildId) {
          return 'Come back when you have a guild!';
        }

        const message =
          'Tell me how much you would like to TAKE to the treasury.';

        env.callbacks?.emit({
          type: GameServerResponse.SendInput,
          title: 'Take from Treasury',
          content: 'How much gold?',
          extraData: { okText: 'Yes, take it!', cancelText: 'No, cancel' },
          okAction: {
            command: `!privatesay`,
            args: `${npc.uuid}, take $value`,
          },
        });

        return message;
      });

    parser
      .addCommand('takeamount')
      .setSyntax(['take <string:amount*>'])
      .setLogic(async ({ env, args }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (!player.guildId) {
          return 'Come back when you have a guild!';
        }

        const guildRef = game.guildManager.getGuildById(player.guildId);
        if (!guildRef) {
          return 'Your guild does not exist?';
        }

        let amount = game.userInputHelper.cleanNumber(args['amount*'], 0, {
          floor: true,
        });
        amount = Math.min(amount, guildRef.treasury);
        if (amount <= 0) return 'You cannot take that much.';

        game.guildManager.removeFromTreasury(player, amount);
        game.currencyHelper.gainCurrency(player, amount, Currency.Gold);

        return `I've given ${amount.toLocaleString()} to you from your treasury!`;
      });
  }

  tick() {}
}
