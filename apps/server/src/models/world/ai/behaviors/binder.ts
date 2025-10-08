import type { Parser } from 'muud';

import type {
  IAIBehavior,
  IBinderBehavior,
  IDialogChatAction,
  INPC,
} from '@lotr/interfaces';
import { GameServerResponse, ItemClass, ItemSlot } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

import { itemPropertyGet, itemPropertySet } from '@lotr/content';
import type { Game } from '../../../../helpers';

export class BinderBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IBinderBehavior) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const message = `Greetings, ${player.name}! I am he who can BIND items to thee.`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Bind', action: 'bind' },
            { text: 'No thanks!', action: 'noop' },
          ],
        };

        game.transmissionHelper.sendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return 'Hello!';
      });

    parser
      .addCommand('bind')
      .setSyntax(['bind'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        // Bind the item
        const item = player.items.equipment[ItemSlot.RightHand];
        if (!item) return 'You must be holding an item in your right hand!';
        if (item.mods.owner === player.username) {
          return 'You already own that item!';
        }
        if (item.mods.owner && item.mods.owner !== player.username) {
          return 'That item belongs to someone else!';
        }

        // Check for unbindable item classes
        const itemClass = itemPropertyGet(item, 'itemClass');

        if (itemClass === ItemClass.Corpse) return 'That is disrespectful.';
        if (itemClass === ItemClass.Coin) {
          return "I can't engrave onto something so small.";
        }

        itemPropertySet(item, 'owner', player.username);

        const ach = game.achievementsHelper.getItemForAchievementUse(item.name);
        if (ach) {
          game.achievementsHelper.earnAchievement(player, ach.name);
        }

        if (item.mods.owner === player.username) {
          return 'Done! It is now yours.';
        }

        return 'I was unable to bind that item!';
      });
  }

  tick() {}
}
