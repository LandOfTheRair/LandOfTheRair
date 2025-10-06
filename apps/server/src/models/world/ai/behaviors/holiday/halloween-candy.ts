import type { Parser } from 'muud';

import type { IAIBehavior, IDialogChatAction, INPC } from '@lotr/interfaces';
import { Currency, GameServerResponse, ItemSlot } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../../../../helpers';

export class HalloweenCandyBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do nt exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];

        let message =
          "Sorry man, I only deal in brains and candy. Maybe you got a SACK full of 'em?";
        if (!rightHand) {
          message =
            "If you want tokens, bring me brains and candy. I can also check your SACK, if you have 'em there.";
        }

        if (rightHand) {
          if (rightHand.name === 'Halloween Zombie Brain') {
            game.characterHelper.setRightHand(player, undefined);
            game.currencyHelper.gainCurrency(player, 5, Currency.Halloween);
            return "Thanks for the brains, chum. Here's 5 tokens, knock yourself out.";
          }

          if (rightHand.name === 'Halloween Candy Pile') {
            game.characterHelper.setRightHand(player, undefined);
            game.currencyHelper.gainCurrency(player, 10, Currency.Halloween);
            return "Thanks for the candy, chum. Here's 10 tokens, knock yourself out.";
          }

          if (rightHand.name.includes('Halloween Candy - ')) {
            game.characterHelper.setRightHand(player, undefined);
            game.currencyHelper.gainCurrency(player, 1, Currency.Halloween);
            return "Thanks for the candy, chum. Here's a token, don't spend it all in one place.";
          }
        }

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Yeah, check it out', action: 'sack' },
            { text: 'Nope', action: 'noop' },
          ],
        };

        game.transmissionHelper.sendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('sack')
      .setSyntax(['sack'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const brainIndexes = player.items.sack.items.filter(
          (x) => x.name === 'Halloween Zombie Brain',
        );
        const pileIndexes = player.items.sack.items.filter(
          (x) => x.name === 'Halloween Candy Pile',
        );
        const candyIndexes = player.items.sack.items.filter((x) =>
          x.name.includes('Halloween Candy -'),
        );

        game.inventoryHelper.removeItemsFromSackByUUID(player, [
          ...brainIndexes.map((x) => x.uuid),
          ...pileIndexes.map((x) => x.uuid),
          ...candyIndexes.map((x) => x.uuid),
        ]);

        const tokensGained =
          brainIndexes.length * 5 +
          pileIndexes.length * 10 +
          candyIndexes.length;

        if (tokensGained === 0) return "Hey, I can't find anything in here.";

        game.currencyHelper.gainCurrency(
          player,
          tokensGained,
          Currency.Halloween,
        );

        return `Woah dude, thanks! Here's ${tokensGained.toLocaleString()} pumpkin coins for your trouble.`;
      });
  }

  tick() {}
}
