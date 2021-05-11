import { Parser } from 'muud';

import { Game } from '../../../../../helpers';
import { Currency, distanceFrom, GameServerResponse,
  IAIBehavior, IDialogChatAction, INPC, IPlayer, ItemSlot } from '../../../../../interfaces';

export class ChristmasSantaBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser) {

    const updateGiftsCount = (player: IPlayer, count = 1) => {
      const questData = game.questHelper.getQuestProgress(player, 'Give Gifts');
      questData.count = questData.count ?? 0;
      questData.count += count;

      const gifts = [
        { threshold: 5,   item: 'Christmas Coal' },
        { threshold: 50,  item: 'Christmas Gem' },
        { threshold: 150, item: 'Christmas Carrot' },
        { threshold: 250, item: 'Antanian Willpower Potion' },
        { threshold: 500, item: 'Christmas Snowglobe' }
      ];

      gifts.forEach(gift => {
        if (questData.count >= gift.threshold && questData.count - count < gift.threshold) {
          const itemRef = game.itemCreator.getSimpleItem(gift.item);
          game.characterHelper.setRightHand(player, itemRef);
        }
      });

      if (game.questHelper.isQuestComplete(player, 'Give Gifts')) {
        game.questHelper.completeQuest(player, 'Give Gifts');
      }
    };

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Come here!';

        if (!game.questHelper.hasQuest(player, 'Give Gifts')) {
          game.questHelper.startQuest(player, 'Give Gifts');
        }

        if (player.items.equipment[ItemSlot.RightHand]?.name.includes('Christmas Gift -')) {
          game.characterHelper.setRightHand(player, undefined);
          game.currencyHelper.gainCurrency(player, 15, Currency.Christmas);
          updateGiftsCount(player, 1);
          return 'Thanks for the gift!';
        }

        const message = `Ho ho ho! Can you bring me some presents, and help me save Christmas? Maybe from your SACK to mine?
        Bring me a lot of gifts and I can reward you!`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Yeah, check it out', action: 'sack' },
            { text: 'Nope', action: 'noop' },
          ]
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return message;
      });

    parser.addCommand('sack')
      .setSyntax(['sack'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Come here!';

        if (!game.questHelper.hasQuest(player, 'Give Gifts')) {
          game.questHelper.startQuest(player, 'Give Gifts');
        }

        if (player.items.equipment[ItemSlot.RightHand]) return 'Empty your hand, I might have a gift for you!';

        const presentIndexes = player.items.sack.items.filter(x => x.name.includes('Christmas Gift -'));

        game.inventoryHelper.removeItemsFromSackByUUID(player, presentIndexes.map(x => x.uuid));

        const tokensGained = presentIndexes.length * 15;
        updateGiftsCount(player, presentIndexes.length);

        if (tokensGained === 0) return 'Hey, I can\'t find anything in here.';

        game.currencyHelper.gainCurrency(player, tokensGained, Currency.Christmas);

        return `Ho ho ho, thank you, adventurer! Here's ${tokensGained.toLocaleString()} snowflake coins for your trouble.`;
      });
  }

  tick() {}
}
