import { uniq } from 'lodash';

import type {
  IAIBehavior,
  IDialogChatAction,
  INPC,
  IPlayer,
  ISimpleItem,
  IVendorBehavior,
  IVendorItem,
} from '@lotr/interfaces';
import {
  Currency,
  GameAction,
  GameServerResponse,
  ItemSlot,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import type { Parser } from 'muud';

import { itemGet, itemPropertyGet } from '@lotr/content';
import { consoleError } from '@lotr/logger';
import type { Game } from '../../../../helpers';

export class VendorBehavior implements IAIBehavior {
  private formattedVendorItems: ISimpleItem[] = [];
  private formattedVendorDailyItems: ISimpleItem[] = [];
  private finalizedVendorCurrency: Currency;

  public get vendorItems() {
    return this.formattedVendorItems;
  }

  public get vendorDailyItems() {
    return this.formattedVendorDailyItems;
  }

  public get vendorCurrency() {
    return this.finalizedVendorCurrency;
  }

  init(game: Game, npc: INPC, parser: Parser, behavior: IVendorBehavior) {
    const npcVendorItems = (behavior.vendorItems || [])
      .map((i) => this.reformatItem(game, npc, i, -1))
      .filter(Boolean);
    const npcVendorDailyItems = (behavior.dailyVendorItems || [])
      .map((i, idx) => this.reformatItem(game, npc, i, idx))
      .filter(Boolean);
    const npcVendorCurrency = behavior.vendorCurrency || Currency.Gold;

    this.finalizedVendorCurrency = npcVendorCurrency;

    this.formattedVendorItems = npcVendorItems as ISimpleItem[];
    this.formattedVendorDailyItems = npcVendorDailyItems as ISimpleItem[];

    if (npcVendorDailyItems.length === 0 && npcVendorItems.length === 0) {
      consoleError(
        'Behavior:Vendor',
        new Error(`NPC at ${npc.map}-${npc.x},${npc.y} has no items to sell.`),
      );
    }

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          action: GameAction.NPCActionShowVendor,
          npcUUID: npc.uuid,
          npcName: npc.name,
          npcSprite: npc.sprite,
          npcVendorCurrency,
          npcVendorItems,
          npcVendorDailyItems,
        });

        return `Hello, ${env?.player.name}!`;
      });

    parser
      .addCommand('assess')
      .setSyntax(['assess'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You need to hold something in your right hand!';

        const canSellItem = game.inventoryHelper.canSellItem(player, rightHand);

        if (!canSellItem) {
          env?.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: 'Assess Item',
            content: "I won't buy that item from you.",
            extraData: { npcSprite: npc.sprite },
          });

          return "I won't buy that item from you.";
        }

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: 'Assess Item',
          content: `I would pay ${game.inventoryHelper.itemValue(player, rightHand).toLocaleString()} gold for that item. Want to sell it?`,
          extraData: {
            npcSprite: npc.sprite,
            okText: 'Yes, buy it from me!',
            cancelText: 'No thanks',
          },
          okAction: { command: '!RtM', args: `_ ${npc.uuid}` },
        });

        return `I would pay ${game.inventoryHelper.itemValue(player, rightHand).toLocaleString()} for that item.`;
      });

    parser
      .addCommand('sellall')
      .setSyntax(['sellall <string:itemclass*>'])
      .setLogic(async ({ env, args }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const itemClass = args['itemclass*'];

        if (!itemClass) {
          const message =
            'What would you like to sell me all of (from your sack)?';

          const options = uniq(
            player.items.sack.items.map((x) => itemPropertyGet(x, 'itemClass')),
          ).sort();

          const formattedChat: IDialogChatAction = {
            message,
            displayTitle: npc.name,
            displayNPCName: npc.name,
            displayNPCSprite: npc.sprite,
            displayNPCUUID: npc.uuid,
            options: [
              ...options.map((x) => ({ text: x, action: `sellall ${x}` })),
              { text: 'Nothing', action: 'noop' },
            ],
          };

          game.transmissionHelper.sendResponseToAccount(
            player.username,
            GameServerResponse.DialogChat,
            formattedChat,
          );

          return message;
        }

        const validSackItemsForSale = player.items.sack.items.filter(
          (x) =>
            itemPropertyGet(x, 'itemClass') === itemClass &&
            game.inventoryHelper.canSellItem(player, x),
        );

        validSackItemsForSale.forEach((item) => {
          game.inventoryHelper.sellItem(player, item);
        });

        game.inventoryHelper.removeItemsFromSackByUUID(
          player,
          validSackItemsForSale.map((x) => x.uuid),
        );

        return `Done! I've sold all of your ${itemClass}.`;
      });
  }

  tick() {}

  private reformatItem(
    game: Game,
    npc: INPC,
    vItem: IVendorItem,
    dailySlot: number,
  ): ISimpleItem | null {
    const base: any = { name: vItem.item, mods: {} };
    if (dailySlot >= 0) {
      base.uuid = `daily-${npc.map}-${npc.name}-${dailySlot}-${vItem.item}`;
    }

    const baseItem = itemGet(vItem.item);
    if (!baseItem) {
      consoleError(
        `Vendor:${npc.name}`,
        new Error(`Could not get item definition for ${vItem.item}.`),
      );
      return null;
    }

    base.mods.value = baseItem.value;

    if (vItem.valueMult) base.mods.value *= vItem.valueMult;
    if (vItem.valueSet) base.mods.value = vItem.valueSet;

    return base;
  }
}
