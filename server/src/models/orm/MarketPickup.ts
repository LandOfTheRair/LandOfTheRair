import { Entity, Property } from '../../helpers/core/db/decorators';
import {
  IItem,
  IItemDefinition,
  IItemRequirements,
  IMarketPickup,
  ISimpleItem,
  ItemClass,
} from '../../interfaces';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class MarketPickup extends BaseEntity implements IMarketPickup {
  @Property() username: string;

  @Property() itemInfo: {
    sprite: number;
    itemClass: ItemClass;
    requirements: IItemRequirements;
    uuid: string;
    cosmetic: string;
    condition: number;
    itemOverride: IItemDefinition & Partial<IItem> & ISimpleItem;
  };

  @Property() gold: number;
}
