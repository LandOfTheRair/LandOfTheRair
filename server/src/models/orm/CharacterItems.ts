import { Entity, MongoEntity, OneToOne, PrimaryKey, Property } from 'mikro-orm';
import { SerializedPrimaryKey } from 'mikro-orm/dist/decorators';
import { ObjectID } from 'mongodb';
import { IItem, ItemContainer, ItemSlot } from '../../interfaces';
import { Player } from './Player';

@Entity()
export class CharacterItems implements CharacterItems, MongoEntity<CharacterItems> {

  @PrimaryKey() _id: ObjectID;
  @SerializedPrimaryKey() id: string;

  @OneToOne() player: Player;

  @Property() potion: IItem;
  @Property() equipment: { [key in ItemSlot]: IItem };

  @Property() sack: ItemContainer;
  @Property() belt: ItemContainer;
  @Property() pouch: ItemContainer;

  // TODO: lockers, buyback

}
