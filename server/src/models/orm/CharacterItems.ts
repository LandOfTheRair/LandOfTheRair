import { Entity, MongoEntity, OneToOne, PrimaryKey, Property, SerializedPrimaryKey } from 'mikro-orm';
import { ObjectID } from 'mongodb';

import { ISimpleItem, ItemContainer, ItemSlot } from '../../interfaces';
import { Player } from './Player';

@Entity()
export class CharacterItems implements CharacterItems, MongoEntity<CharacterItems> {

  @PrimaryKey() _id: ObjectID;
  @SerializedPrimaryKey() id: string;

  @OneToOne() player: Player;

  @Property() potion: ISimpleItem;
  @Property() equipment: { [key in ItemSlot]?: ISimpleItem } = {};

  @Property() sack: ItemContainer;
  @Property() belt: ItemContainer;
  @Property() pouch: ItemContainer;

  @Property() buyback: ISimpleItem[] = [];

  // TODO: lockers

}
