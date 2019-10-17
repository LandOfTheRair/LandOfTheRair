
import { Cascade, Collection, Entity, MongoEntity, OneToMany, PrimaryKey, Property, SerializedPrimaryKey } from 'mikro-orm';
import { ObjectID } from 'mongodb';

import { IAccount, PROP_SERVER_ONLY, PROP_TEMPORARY } from '../../interfaces';
import { Player } from './Player';

@Entity()
export class Account implements IAccount, MongoEntity<Account> {

  @PrimaryKey() _id: ObjectID;
  @SerializedPrimaryKey() id: string;

  @Property(PROP_SERVER_ONLY()) createdAt = new Date();
  @Property(PROP_SERVER_ONLY()) password: string;

  @Property(PROP_TEMPORARY()) inGame: boolean;

  @Property() username: string;
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

  // TODO: shared lockers and bank should be properties of account (bank needs region separators)

}
