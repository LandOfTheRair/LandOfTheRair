
import { BaseEntity } from '../../helpers/core/db/base/BaseEntity';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { ICharacterItems, IItemContainer, ISimpleItem, ItemSlot } from '../../interfaces';

@Entity()
export class PlayerItems extends BaseEntity implements ICharacterItems {

  // relation props

  // other props
  @Property() potion: ISimpleItem;
  @Property() equipment: { [key in ItemSlot]?: ISimpleItem } = {};

  @Property() sack: IItemContainer = { items: [] };
  @Property() belt: IItemContainer = { items: [] };
  @Property() pouch: IItemContainer = { items: [] };

  @Property() buyback: ISimpleItem[] = [];

  // TODO: lockers

}
