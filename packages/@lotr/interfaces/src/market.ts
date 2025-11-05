import { IItem, IItemDefinition, IItemRequirements, ISimpleItem } from './item';
import { ItemClassType } from './itemtypes';

export interface IMarketItemInfo {
  sprite: number;
  itemClass: ItemClassType;
  requirements: IItemRequirements;
  uuid: string;
  cosmetic: string;
  condition: number;
  itemOverride: IItemDefinition & Partial<IItem> & ISimpleItem;
}

export interface IMarketListing {
  itemId: string;

  itemInfo: IMarketItemInfo;

  listingInfo: {
    listedAt: number;
    seller: string;
    price: number;
  };
}

export interface IMarketPickup {
  username: string;

  itemInfo?: IMarketItemInfo;

  gold?: number;
}
