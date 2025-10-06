import { startCase } from 'lodash';
import type { Parser } from 'muud';

import type {
  IAIBehavior,
  ICosmeticsBehavior,
  IDialogChatAction,
  INPC,
} from '@lotr/interfaces';
import {
  GameServerResponse,
  ItemClass,
  ItemSlot,
  SilverPurchase,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../../../helpers';

export class CosmeticBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: ICosmeticsBehavior) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const message = `Hey, ${player.name}! I'm Cosmetica - I can make your items more f~a~s~h~i~o~n~a~b~l~e!
        You can hold a cosmetic scroll in your left and an item in your right, and say IMBUE to add the cosmetic.
        BE CAREFUL! I will overwrite an existing cosmetic when imbuing.
        Alternatively, leave your left hand empty and I can EXTRACT a cosmetic - but not all cosmetics are extractable!
        Finally, I can take from your SILVER cosmetics and give those to you.`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Imbue', action: 'imbue' },
            { text: 'Extract', action: 'extract' },
            { text: 'Silver', action: 'silver' },
            { text: 'Leave', action: 'noop' },
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
      .addCommand('imbue')
      .setSyntax(['imbue'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const item = player.items.equipment[ItemSlot.RightHand];
        const scroll = player.items.equipment[ItemSlot.LeftHand];
        if (!item) return 'You must be holding an item in your right hand!';
        if (!scroll || !scroll.name.includes('Cosmetic Scroll')) {
          return 'You must be holding a cosmetic scroll in your left hand!';
        }
        if (item.mods.owner && item.mods.owner !== player.username) {
          return 'That item belongs to someone else!';
        }

        // Check for unimbuable item classes
        const itemClass = game.itemHelper.getItemProperty(item, 'itemClass');

        if (itemClass === ItemClass.Corpse) return 'That is disrespectful.';
        if (itemClass === ItemClass.Coin) {
          return "I can't engrave onto something so small.";
        }

        const cosmetic = game.itemHelper.getItemProperty(scroll, 'cosmetic');

        item.mods.cosmetic = { name: cosmetic.name };
        game.characterHelper.setLeftHand(player, undefined);

        return 'Done! Look at how cool your item looks!';
      });

    parser
      .addCommand('extract')
      .setSyntax(['extract'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const item = player.items.equipment[ItemSlot.RightHand];
        const left = player.items.equipment[ItemSlot.LeftHand];
        if (!item) return 'You must be holding an item in your right hand!';
        if (left) return 'You must empty your left hand!';
        if (item.mods.owner && item.mods.owner !== player.username) {
          return 'That item belongs to someone else!';
        }

        const cosmetic = game.itemHelper.getItemProperty(item, 'cosmetic');
        if (!cosmetic) return 'That item has no cosmetic!';
        if (cosmetic.isPermanent) return 'That cosmetic cannot be removed!';

        const scroll = game.itemCreator.getSimpleItem(
          `Cosmetic Scroll - ${startCase(cosmetic.name)}`,
        );
        game.itemHelper.setItemProperty(item, 'cosmetic', null);
        game.characterHelper.setLeftHand(player, scroll);

        return 'Done! Beware, this scroll is not bound to you!';
      });

    parser
      .addCommand('silver')
      .setSyntax(['silver'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const account = game.lobbyManager.getAccount(player.username);
        const allAvailable =
          game.subscriptionHelper.getSilverCosmetics(account);

        if (Object.values(allAvailable).every((x) => !x)) {
          return 'You have no purchased cosmetics!';
        }

        const message = `Just tell me "take <type>", where type is one of these: ${Object.keys(allAvailable).join(', ')}`;

        const options: any[] = [];
        Object.keys(allAvailable).forEach((key) => {
          if ((allAvailable[key] ?? 0) <= 0) return;

          options.push({
            text: `${key} (${allAvailable[key]})`,
            action: `take ${key}`,
          });
        });

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [...options, { text: 'Leave', action: 'noop' }],
        };

        game.transmissionHelper.sendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('take')
      .setSyntax(['take <string:cosmetic*>'])
      .setLogic(async ({ env, args }) => {
        const player = env?.player;

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        if (player.items.equipment[ItemSlot.RightHand]) {
          return 'Empty your right hand first!';
        }

        const cosmetic = args['cosmetic*'].toLowerCase();
        const account = game.lobbyManager.getAccount(player.username);
        const allAvailable =
          game.subscriptionHelper.getSilverCosmetics(account);

        if ((allAvailable[cosmetic] ?? 0) <= 0) {
          return 'You do not have any of that cosmetic!';
        }

        let silverKey = '';
        let itemSuffix = '';

        switch (cosmetic) {
          case 'inversify': {
            silverKey = SilverPurchase.CosmeticInversify;
            itemSuffix = 'Inversify';
            break;
          }
          case 'ancientify': {
            silverKey = SilverPurchase.CosmeticAncientify;
            itemSuffix = 'Ancientify';
            break;
          }
          case 'etherpulse': {
            silverKey = SilverPurchase.CosmeticEtherPulse;
            itemSuffix = 'Ether Pulse';
            break;
          }
          case 'ghostether': {
            silverKey = SilverPurchase.CosmeticGhostEther;
            itemSuffix = 'Ghost Ether';
            break;
          }
        }

        game.subscriptionHelper.takeCosmetic(
          account,
          silverKey as SilverPurchase,
        );
        const item = game.itemCreator.getSimpleItem(
          `Cosmetic Scroll - ${itemSuffix}`,
        );
        game.characterHelper.setRightHand(player, item);

        return 'Done! Beware, this scroll is not bound to you!';
      });
  }

  tick() {}
}
