
import { Cascade, Collection, Entity, MongoEntity, OneToMany, PrimaryKey, Property } from 'mikro-orm';
import { ObjectID } from 'mongodb';

import { SerializedPrimaryKey } from 'mikro-orm/dist/decorators';
import { IAccount } from '../../interfaces';
import { Player } from './Player';

@Entity()
export class Account implements IAccount, MongoEntity<Account> {

  @PrimaryKey() _id: ObjectID;
  @SerializedPrimaryKey() id: string;

  @Property() createdAt = new Date();
  @Property() username: string;
  @Property({ hidden: true }) password: string;
  @Property() email: string;
  @OneToMany(
    () => Player,
    player => player.account,
    { cascade: [Cascade.ALL], orphanRemoval: true }
  ) players = new Collection<Player>(this);

  @Property() isGameMaster = false;
  @Property() isTester = false;
  @Property() isSubscribed = false;

  @Property() subscriptionEndsTimestamp = -1;
  @Property() trialEndsTimestamp = -1;

}
