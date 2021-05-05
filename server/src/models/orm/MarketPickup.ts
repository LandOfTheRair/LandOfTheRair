
import { Entity, Property } from '../../helpers/core/db/decorators';
import { IItem, IItemRequirements, IMarketPickup, ItemClass } from '../../interfaces';
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
    itemOverride: Partial<IItem>;
  };

  @Property() gold: number;
}
