import { itemGet, itemPropertyGet } from '@lotr/content';
import { loseCurrency } from '@lotr/currency';
import type {
  IItem,
  IItemDefinition,
  IMarketItemInfo,
  IPlayer,
  ISimpleItem,
} from '@lotr/interfaces';
import { Currency } from '@lotr/interfaces';
import { calculateListingFee } from '@lotr/shared';
import { Injectable } from 'injection-js';
import { ObjectId } from 'mongodb';
import type { Redeemable } from '../../../models';
import { MarketListing, MarketPickup } from '../../../models';
import { BaseService } from '../../../models/BaseService';

@Injectable()
export class MarketDB extends BaseService {
  public async init() {}

  public async getListingById(id: string): Promise<MarketListing | null> {
    return this.game.db.findSingle<MarketListing>(MarketListing, {
      _id: new ObjectId(id),
    });
  }

  public async getPickupById(id: string): Promise<MarketPickup | null> {
    return this.game.db.findSingle<MarketPickup>(MarketPickup, {
      _id: new ObjectId(id),
    });
  }

  public async removeListingById(id: string): Promise<any> {
    return this.game.db.removeSingle<MarketListing>(MarketListing, {
      _id: new ObjectId(id),
    });
  }

  public async removePickupById(id: string): Promise<any> {
    return this.game.db.removeSingle<MarketPickup>(MarketPickup, {
      _id: new ObjectId(id),
    });
  }

  public async numberOfListings(username: string): Promise<number> {
    const listings = await this.game.db.findMany<MarketListing>(MarketListing, {
      'listingInfo.seller': username,
    });
    return listings.length;
  }

  public async getPickupsByUsername(
    username: string,
  ): Promise<MarketPickup[] | null> {
    return this.game.db.findMany<MarketPickup>(MarketPickup, { username });
  }

  public async listItem(
    player: IPlayer,
    item: ISimpleItem,
    price: number,
  ): Promise<any> {
    const itemDefinition = itemGet(item.name)!;
    const listingFee = calculateListingFee(itemDefinition, price);
    loseCurrency(player, listingFee, Currency.Gold);

    this.game.messageHelper.sendSimpleMessage(
      player,
      `You've spent ${listingFee.toLocaleString()} gold listing your item for sale.`,
    );

    const listing: MarketListing = new MarketListing();
    listing._id = new ObjectId();

    listing.itemId = item.name;
    listing.listingInfo = {
      listedAt: Date.now(),
      seller: player.username,
      price,
    };

    listing.itemInfo = {
      uuid: item.uuid,
      sprite: itemPropertyGet(item, 'sprite'),
      itemClass: itemPropertyGet(item, 'itemClass'),
      requirements: itemPropertyGet(item, 'requirements'),
      cosmetic: itemPropertyGet(item, 'cosmetic'),
      condition: itemPropertyGet(item, 'condition') ?? 20000,
      itemOverride: Object.assign({}, itemDefinition, item.mods, {
        mods: item.mods || {},
      }) as IItemDefinition & Partial<IItem> & ISimpleItem,
    };

    return this.game.db.save(listing);
  }

  public async createPickupFromItemInfo(
    username: string,
    itemInfo: IMarketItemInfo,
  ): Promise<any> {
    const pickup: MarketPickup = new MarketPickup();
    pickup._id = new ObjectId();

    pickup.gold = 0;
    pickup.itemInfo = itemInfo;
    pickup.username = username;

    return this.game.db.save(pickup);
  }

  public async createPickupFromSale(
    username: string,
    saleValue: number,
  ): Promise<any> {
    const pickup: MarketPickup = new MarketPickup();
    pickup._id = new ObjectId();

    pickup.gold = saleValue;
    pickup.username = username;

    return this.game.db.save(pickup);
  }

  public async createPickupFromRedeemable(
    username: string,
    redeemable: Redeemable,
  ): Promise<any> {
    if (redeemable.gold) {
      const pickup: MarketPickup = new MarketPickup();
      pickup._id = new ObjectId();
      pickup.username = username;
      pickup.gold = redeemable.gold;

      await this.game.db.save(pickup);
    }

    if (redeemable.item) {
      const pickup: MarketPickup = new MarketPickup();
      pickup._id = new ObjectId();
      pickup.username = username;

      const item = this.game.itemCreator.getSimpleItem(redeemable.item);
      const itemDefinition = itemGet(item.name);

      pickup.itemInfo = {
        condition: 20000,
        cosmetic: '',
        uuid: item.uuid,
        sprite: itemPropertyGet(item, 'sprite'),
        itemClass: itemPropertyGet(item, 'itemClass'),
        requirements: itemPropertyGet(item, 'requirements'),
        itemOverride: Object.assign({}, itemDefinition, item),
      };

      await this.game.db.save(pickup);
    }
  }
}
