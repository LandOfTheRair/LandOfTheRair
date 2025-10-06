import type { Parser } from 'muud';

import type {
  IAIBehavior,
  INPC,
  IPlayer,
  ISimpleItem,
  ISteelroseBehavior,
} from '@lotr/interfaces';
import { Currency, GameAction, ItemSlot } from '@lotr/interfaces';
import { distanceFrom, itemListError } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../../../helpers';

export class SteelroseBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: ISteelroseBehavior) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          action: GameAction.NPCActionShowMarket,
          npcUUID: npc.uuid,
          npcName: npc.name,
          npcSprite: npc.sprite,
        });

        return `Hello, ${player.name}! Welcome to the Steelrose Market!`;
      });

    parser
      .addCommand('buy')
      .setSyntax(['buy <string:listingid*>'])
      .setLogic(async ({ env, args }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        const listing = args['listingid*'];

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const listingRef = await game.marketDB.getListingById(listing);
        if (!listingRef) return 'That listing is no longer valid!';

        if (listingRef.listingInfo.seller === player.username) {
          await game.marketDB.createPickupFromItemInfo(
            player.username,
            listingRef.itemInfo,
          );
          await game.marketDB.removeListingById(listing);
          return "I've cancelled your listing!";
        }

        if (
          !game.currencyHelper.hasCurrency(
            player,
            listingRef.listingInfo.price,
            Currency.Gold,
          )
        ) {
          return 'You do not have enough gold!';
        }
        game.currencyHelper.loseCurrency(
          player,
          listingRef.listingInfo.price,
          Currency.Gold,
        );

        await game.marketDB.createPickupFromItemInfo(
          player.username,
          listingRef.itemInfo,
        );
        await game.marketDB.createPickupFromSale(
          listingRef.listingInfo.seller,
          listingRef.listingInfo.price,
        );
        await game.marketDB.removeListingById(listing);

        return 'The item was purchased successfully!';
      });

    parser
      .addCommand('sell')
      .setSyntax(['sell <string:price*>'])
      .setLogic(async ({ env, args }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        const price = game.userInputHelper.cleanNumber(args['price*'], 0, {
          round: true,
          floor: true,
        });

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (isNaN(price) || price <= 0) {
          return 'That price does not work in this market!';
        }
        if (price > 1_000_000_000_000) return 'That price is a bit too high!';

        const sellItem = player.items.equipment[ItemSlot.RightHand];
        if (!sellItem) {
          return 'You need to hold an item in your right hand to sell it!';
        }

        const listingError = itemListError(
          player,
          sellItem,
          game.itemHelper.getItemDefinition(sellItem.name),
          price,
        );
        if (listingError) return listingError;

        const maxListingSetting =
          game.contentManager.getGameSetting(
            'npcscript',
            'steelrose.maxListings',
          ) ?? 25;

        const curListings = await game.marketDB.numberOfListings(
          player.username,
        );
        const maxListings = game.subscriptionHelper.maxMarketListings(
          player,
          maxListingSetting,
        );

        if (curListings >= maxListings) {
          return 'You have too many items on the market board right now!';
        }

        await game.marketDB.listItem(player, sellItem, price);

        game.characterHelper.setRightHand(player, undefined);

        game.discordHelper.sendMarketplaceMessage(player, sellItem, price);

        return "I've listed the item for sale!";
      });

    parser
      .addCommand('take')
      .setSyntax(['take <string:pickupid*>'])
      .setLogic(async ({ env, args }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        const pickup = args['pickupid*'];

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const pickupRef = await game.marketDB.getPickupById(pickup);
        if (!pickupRef) return 'That pickup is no longer valid!';

        if (pickupRef.itemInfo && player.items.equipment[ItemSlot.RightHand]) {
          return 'Empty your right hand to pick that up!';
        }
        await game.marketDB.removePickupById(pickup);

        game.currencyHelper.gainCurrency(
          player,
          pickupRef.gold ?? 0,
          Currency.Gold,
        );

        if (pickupRef.itemInfo) {
          const item = game.itemCreator.getSimpleItem(
            pickupRef.itemInfo.itemOverride.name ?? '',
          );
          if (!item) return 'Something bad happened!';

          item.mods =
            (pickupRef.itemInfo.itemOverride as ISimpleItem).mods ?? {};
          item.mods.condition = pickupRef.itemInfo.condition ?? 20000;
          item.uuid = pickupRef.itemInfo.uuid;

          game.characterHelper.setRightHand(player, item);
        }

        return 'The item was taken successfully!';
      });
  }

  tick() {}
}
