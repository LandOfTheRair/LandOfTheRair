
import { Entity, IEntity, PrimaryKey, Property } from 'mikro-orm';
import { ObjectID } from 'mongodb';

import { IAccount, ICharacter } from '../../interfaces';

@Entity()
export class Account implements IAccount {

  @PrimaryKey() _id: ObjectID;

  @Property() createdAt = new Date();
  @Property() username!: string;
  @Property() password!: string;
  @Property() email!: string;
  @Property() players: ICharacter[] = [];

  @Property() isGameMaster = false;
  @Property() isTester = false;
  @Property() isSubscribed = false;

  @Property() subscriptionEndsTimestamp = -1;
  @Property() trialEndsTimestamp = -1;

}

export interface Account extends IEntity<string> {}
