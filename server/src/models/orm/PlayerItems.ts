import { Entity, OneToOne, Property } from '@mikro-orm/core';

import { ICharacterItems, IItemContainer, ISimpleItem, ItemSlot } from '../../interfaces';
import { BaseEntity } from './BaseEntity';
import { Player } from './Player';

@Entity()
export class PlayerItems extends BaseEntity implements ICharacterItems {

  // relation props
  @OneToOne({ hidden: true, mappedBy: 'items' }) player: Player;

  // other props
  @Property() potion: ISimpleItem;
  @Property() equipment: { [key in ItemSlot]?: ISimpleItem } = {};

  @Property() sack: IItemContainer = { items: [] };
  @Property() belt: IItemContainer = { items: [] };
  @Property() pouch: IItemContainer = { items: [] };

  @Property() buyback: ISimpleItem[] = [];

  // TODO: lockers

}
