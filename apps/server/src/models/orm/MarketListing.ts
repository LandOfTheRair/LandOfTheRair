import type {
  IItem,
  IItemDefinition,
  IItemRequirements,
  IMarketListing,
  ISimpleItem,
  ItemClass,
} from '@lotr/interfaces';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class MarketListing extends BaseEntity implements IMarketListing {
  @Property() itemId: string;

  @Property() itemInfo: {
    sprite: number;
    itemClass: ItemClass;
    requirements: IItemRequirements;
    uuid: string;
    cosmetic: string;
    condition: number;
    itemOverride: IItemDefinition & Partial<IItem> & ISimpleItem;
  };

  @Property() listingInfo: {
    listedAt: number;
    seller: string;
    price: number;
  };
}
