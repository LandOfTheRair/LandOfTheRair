
import { Cascade, Entity, IdentifiedReference, ManyToOne, MongoEntity, OneToOne, OnInit, PrimaryKey, Property } from 'mikro-orm';
import { SerializedPrimaryKey } from 'mikro-orm/dist/decorators';
import { ObjectID } from 'mongodb';
import { Allegiance, BaseClass, CharacterCurrency, ICharacter, StatBlock } from '../../interfaces';
import { Account } from './Account';
import { CharacterItems } from './CharacterItems';

@Entity()
export class Player implements ICharacter, MongoEntity<Player> {

  @PrimaryKey() _id: ObjectID;
  @SerializedPrimaryKey() id: string;

  @ManyToOne() account: IdentifiedReference<Account, 'id'|'_id'>;

  @Property({ hidden: true }) createdAt = new Date();
  @Property() charSlot: number;

  @Property() name: string;
  @Property() allegiance: Allegiance;
  @Property() baseClass: BaseClass;
  @Property() gender: 'male'|'female';

  @Property() level: number;
  @Property() xp: number;
  @Property() currency: CharacterCurrency;

  @Property() map: string;
  @Property() x: number;
  @Property() y: number;

  @Property() stats: StatBlock;

  @OneToOne(
    () => CharacterItems,
    (item) => item.player,
    { cascade: [Cascade.ALL] }
  ) items: CharacterItems;

  @OnInit()
  create() {
    if (!this.map) this.map = 'Tutorial';
    if (!this.x) this.x = 14;
    if (!this.y) this.y = 14;
    if (!this.level) this.level = 1;
    if (!this.xp) this.xp = 1000;
  }
}
