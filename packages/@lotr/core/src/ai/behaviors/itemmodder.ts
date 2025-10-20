import type { Parser } from 'muud';

import type {
  IAIBehavior,
  IDialogChatAction,
  IItemModderBehavior,
  INPC,
  IServerGame,
} from '@lotr/interfaces';
import { GameServerResponse, ItemSlot } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

import { itemIsOwnedBy, itemPropertyGet } from '@lotr/content';
import { transmissionSendResponseToAccount } from '../../transmission';

export class ItemModderBehavior implements IAIBehavior {
  init(
    game: IServerGame,
    npc: INPC,
    parser: Parser,
    behavior: IItemModderBehavior,
  ) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const message = `Greetings, ${player.name}! I am he who can tweak your items.
        Just tell me one of these things and I can tell you more: PRONE.`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Prone?', action: 'prone' },
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

    parser
      .addCommand('prone')
      .setSyntax(['prone'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (rightHand && leftHand && rightHand.name === leftHand.name) {
          if (
            !itemIsOwnedBy(player, leftHand) ||
            !itemIsOwnedBy(player, rightHand)
          ) {
            return 'You must own both of those items!';
          }

          const proneChance = itemPropertyGet(rightHand, 'proneChance');
          if (!proneChance || proneChance <= 0) {
            return 'That item does not prone!';
          }

          rightHand.mods.proneChance = 0;
          game.characterHelper.setLeftHand(player, undefined);
          return 'Done! No more proning.';
        }

        const message = `Yes! I can remove proning from your item. Bring me two of the same weapon;
        I'll take the one in your left hand, and remove proning from the right.`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [{ text: 'Got it', action: 'noop' }],
        };

        transmissionSendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });
  }

  tick() {}
}
