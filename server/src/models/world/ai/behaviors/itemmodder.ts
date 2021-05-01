import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { GameServerResponse, IAIBehavior, IDialogChatAction, IItemModderBehavior, INPC, ItemSlot } from '../../../../interfaces';

export class ItemModderBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IItemModderBehavior) {

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

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
          ]
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return message;
      });

    parser.addCommand('prone')
      .setSyntax(['prone'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (rightHand && leftHand && rightHand.name === leftHand.name) {
          if (!game.itemHelper.isOwnedBy(player, leftHand)
          || !game.itemHelper.isOwnedBy(player, rightHand)) return 'You must own both of those items!';

          const proneChance = game.itemHelper.getItemProperty(rightHand, 'proneChance');
          if (!proneChance || proneChance <= 0) return 'That item does not prone!';

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
          options: [
            { text: 'Got it', action: 'noop' },
          ]
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return message;
      });
  }

  tick() {}
}
