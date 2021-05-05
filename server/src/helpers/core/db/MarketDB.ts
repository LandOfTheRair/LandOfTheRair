
import { Injectable } from 'injection-js';
import { ObjectId } from 'mongodb';
import { calculateListingFee, Currency, IMarketItemInfo, IPlayer, ISimpleItem } from '../../../interfaces';
import { MarketListing, MarketPickup } from '../../../models';
import { BaseService } from '../../../models/BaseService';
import { Database } from '../Database';

@Injectable()
export class MarketDB extends BaseService {

  constructor(
    private db: Database
  ) {
    super();
  }

  public async init() {
  }

  public async getListingById(id: string): Promise<MarketListing | null> {
    return this.db.findSingle<MarketListing>(MarketListing, { _id: new ObjectId(id) });
  }

  public async getPickupById(id: string): Promise<MarketPickup | null> {
    return this.db.findSingle<MarketPickup>(MarketPickup, { _id: new ObjectId(id) });
  }

  public async removeListingById(id: string): Promise<any> {
    return this.db.removeSingle<MarketListing>(MarketListing, { _id: new ObjectId(id) });
  }

  public async removePickupById(id: string): Promise<any> {
    return this.db.removeSingle<MarketPickup>(MarketPickup, { _id: new ObjectId(id) });
  }

  public async numberOfListings(username: string): Promise<number> {
    const listings = await this.db.findMany<MarketListing>(MarketListing, { 'listingInfo.seller': username });
    return listings.length;
  }

  public async getPickupsByUsername(username: string): Promise<MarketPickup[] | null> {
    return this.db.findMany<MarketPickup>(MarketPickup, { username });
  }

  public async listItem(player: IPlayer, item: ISimpleItem, price: number): Promise<any> {

    const itemDefinition = this.game.itemHelper.getItemDefinition(item.name);
    const listingFee = calculateListingFee(itemDefinition, price);
    this.game.currencyHelper.loseCurrency(player, listingFee, Currency.Gold);

    this.game.messageHelper.sendSimpleMessage(player, `You've spent ${listingFee.toLocaleString()} gold listing your item for sale.`);

    const listing: MarketListing = new MarketListing();
    listing._id = new ObjectId();

    listing.itemId = item.name;
    listing.listingInfo = {
      listedAt: Date.now(),
      seller: player.username,
      price
    };

    listing.itemInfo = {
      uuid: item.uuid,
      sprite: this.game.itemHelper.getItemProperty(item, 'sprite'),
      itemClass: this.game.itemHelper.getItemProperty(item, 'itemClass'),
      requirements: this.game.itemHelper.getItemProperty(item, 'requirements'),
      cosmetic: this.game.itemHelper.getItemProperty(item, 'cosmetic'),
      condition: this.game.itemHelper.getItemProperty(item, 'condition') ?? 20000,
      itemOverride: Object.assign({}, itemDefinition, { mods: item.mods || {} })
    };

    return this.db.save(listing);
  }

  public async createPickupFromItemInfo(username: string, itemInfo: IMarketItemInfo): Promise<any> {

    const pickup: MarketPickup = new MarketPickup();
    pickup._id = new ObjectId();

    pickup.gold = 0;
    pickup.itemInfo = itemInfo;
    pickup.username = username;

    return this.db.save(pickup);
  }

  public async createPickupFromSale(username: string, saleValue: number): Promise<any> {

    const pickup: MarketPickup = new MarketPickup();
    pickup._id = new ObjectId();

    pickup.gold = saleValue;

    return this.db.save(pickup);
  }

}
