import { sample } from 'lodash';
import type { Parser } from 'muud';

import type {
  IAIBehavior,
  IDialogChatAction,
  INPC,
  IPlayer,
  IServerGame,
} from '@lotr/interfaces';
import { GameServerResponse, ItemSlot } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

import { transmissionSendResponseToAccount } from '../../../transmission';

export class ThanksgivingFoodBehavior implements IAIBehavior {
  init(game: IServerGame, npc: INPC, parser: Parser) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const message = `Hello, traveler! Would you like to help us prepare a feast to celebrate?
        I can reward you with a cornucopia of sorts, just bring me four crimson leaves, six apples, and five ears of corn.
        Ask me about a CORNUCOPIA when you're ready!`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'A cornucopia?', action: 'cornucopia' },
            { text: 'Nope', action: 'noop' },
          ],
        };

        transmissionSendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('cornucopia')
      .setSyntax(['cornucopia'])
      .setLogic(async ({ env }) => {
        const player = env?.player as IPlayer;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        if (player.items.equipment[ItemSlot.RightHand]) {
          return 'Please empty your right hand first.';
        }

        const leafIndexes = player.items.sack.items.filter(
          (x) => x.name === 'Thanksgiving Leaf',
        );
        const cornIndexes = player.items.sack.items.filter(
          (x) => x.name === 'Thanksgiving Corn',
        );
        const appleIndexes = player.items.sack.items.filter(
          (x) => x.name === 'Yzalt Steffen Apple',
        );

        if (leafIndexes.length < 4) {
          return 'It seems like you need a few more leaves?';
        }
        if (cornIndexes.length < 5) {
          return 'You might need to bring a few more ears of corn!';
        }
        if (appleIndexes.length < 6) return 'Can you bring some more apples?';

        game.inventoryHelper.removeItemsFromSackByUUID(player, [
          ...leafIndexes.slice(0, 4).map((x) => x.uuid),
          ...cornIndexes.slice(0, 5).map((x) => x.uuid),
          ...appleIndexes.slice(0, 6).map((x) => x.uuid),
        ]);

        const item = sample([
          'Thanksgiving Heal Bottle (XS)',
          'Thanksgiving Heal Bottle (SM)',
          'Thanksgiving Heal Bottle (MD)',
          'Thanksgiving Heal Bottle',
        ]);

        game.characterHelper.setRightHand(
          player,
          game.itemCreator.getSimpleItem(item as string),
        );

        return `Thank you for making our feast a success, ${player.name}!`;
      });
  }

  tick() {}
}
