import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { GameServerResponse, IAIBehavior, IDialogChatAction, INPC, IPlayer, ItemClass, ItemSlot } from '../../../../interfaces';

export class FurUpgraderBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser) {

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        const message = `Brrr! Sure is cold around here.
        Oh, don't mind me, I just look like a yeti because I took one of their furs and got a bit too much.
        Anyway, I can pad your armor with FUR and make it easier for you to survive in the cold too!`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Any fur?', action: 'fur' },
            { text: 'Leave', action: 'noop' },
          ]
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return message;
      });

    parser.addCommand('fur')
      .setSyntax(['fur'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        const message = `Shlep! Sure can do that.
        Only thing is, it counts towards your armor's enchantment limit.
        You should know what that means, 'cause I sure don't. Want to DO IT?
        Hold your fur in your left hand and your armor in your right.`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Do it', action: 'do it' },
            { text: 'Leave', action: 'noop' },
          ]
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return message;
      });

    parser.addCommand('do it')
      .setSyntax(['do it'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'Your must hold armor in your right hand!';

        const leftHand = player.items.equipment[ItemSlot.LeftHand];
        if (!leftHand) return 'Your left hand must have a fur!';

        const { requirements, itemClass } = game.itemHelper.getItemProperties(leftHand, ['itemClass', 'requirements']);

        if (!game.itemHelper.isOwnedBy(player, rightHand)) return 'You do not own that item!';
        if (!game.itemHelper.isOwnedBy(player, leftHand)) return 'You do not own that material!';
        if (!game.itemHelper.canUpgradeItem(rightHand)) return 'I cannot upgrade that item for you!';
        if (itemClass !== ItemClass.Fur) return 'That item is not a fur!';
        if ((requirements?.level ?? 0) > player.level) return 'You are not strong enough to use that fur!';

        game.itemHelper.upgradeItem(rightHand, leftHand.name, true);
        game.characterHelper.setLeftHand(player, undefined);

        return 'Your item is upgraded!';
      });
  }

  tick() {}
}
