import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import {
  Currency,
  distanceFrom,
  GameServerResponse,
  IAIBehavior,
  IDialogChatAction,
  INPC,
  IUpgraderBehavior,
} from '../../../../interfaces';
import { Player } from '../../../../models/orm';

export class GuildmasterBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IUpgraderBehavior) {
    const { creationCost, guildHallCost, maxNameSize, maxTagSize } =
      game.contentManager.settingsData.guild.creation;

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (player.guildId) {
          return 'It looks like you already have a guild!';
        }

        const message = `Hello, ${player.name}!
        I am the Guildmaster! I can help you create a GUILD for you and your closest comrades to adventure together with!
        You are also entitled to your own GUILDHALL, if you pay up, of course!`;

        const options = [
          { text: 'Guild?', action: 'guild' },
          { text: 'Guild Hall?', action: 'guildhall' },
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
      .addCommand('guild')
      .setSyntax(['guild'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (player.guildId) {
          return 'It looks like you already have a guild!';
        }

        const message = `Yes, ${player.name}!
          For the low price of ${creationCost.toLocaleString()} gold, I can set you up with a guild!
          You just need to give me some INFORMATION first, as well as sign on the dotted line.`;

        const options = [
          { text: 'What information?', action: 'information' },
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
      .addCommand('information')
      .setSyntax(['information'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (player.guildId) {
          return 'It looks like you already have a guild!';
        }

        if (
          !game.currencyHelper.hasCurrency(player, creationCost, Currency.Gold)
        ) {
          return 'You do not have enough gold to create a guild!';
        }

        env.callbacks?.emit({
          type: GameServerResponse.SendInput,
          title: 'Guild Name & Tag',
          content: 'Format: [TAG] Guild Name',
          extraData: { okText: 'Yes, do it!', cancelText: 'No, cancel' },
          okAction: {
            command: `!privatesay`,
            args: `${npc.uuid}, create $value`,
          },
        });

        return 'Tell me "CREATE [TAG] Guild Name."';
      });

    parser
      .addCommand('create')
      .setSyntax(['create <string:guildtag> <string:guildname*>'])
      .setLogic(async ({ env, args }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (player.guildId) {
          return 'It looks like you already have a guild!';
        }

        const tag = args.guildtag
          .replace(/[^A-Za-z]/g, '')
          .slice(0, maxTagSize);
        const name = args['guildname*']
          .replace(/[^A-Za-z ]/g, '')
          .slice(0, maxNameSize);

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (`[${tag}]` !== args.guildtag) {
          return `Hmm. You told me "${args.guildtag}" but all I can record is "${tag}".
          Please re-submit your paperwork if this is acceptable!`;
        }

        if (name !== args['guildname*']) {
          return `Hmm. You told me "${args['guildname*']}" but all I can record is ${name}.
          Please re-submit your paperwork if this is acceptable!`;
        }

        if (
          !game.currencyHelper.hasCurrency(player, creationCost, Currency.Gold)
        ) {
          return 'You do not have enough gold to create a guild!';
        }

        game.currencyHelper.loseCurrency(player, creationCost, Currency.Gold);

        try {
          await game.guildManager.createGuild(player as Player, name, tag);
        } catch (e) {
          game.logger.error('GuildCreate', e);
          return 'Hmm. I could not create your guild for some reason. You should try again with a new name and/or tag.';
        }

        return 'Let me get that going for you!';
      });

    parser
      .addCommand('guildhall')
      .setSyntax(['guildhall'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const message = `Yes, ${player.name}!
        For the low price of ${guildHallCost.toLocaleString()} gold, I can add a guild hall to your guild.
        Inside a guild hall, you can recruit your own merchants and assistants, and more!`;

        const options = [{ text: 'Leave', action: 'noop' }];

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
  }

  tick() {}
}
