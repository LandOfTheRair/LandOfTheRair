
import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';

import { IAccount, PROP_SERVER_ONLY, PROP_TEMPORARY } from '../../interfaces';
import { BaseEntity } from './BaseEntity';
import { Player } from './Player';

@Entity()
export class Account extends BaseEntity implements IAccount {

  // relation props
  @OneToMany(
    () => Player,
    player => player.account,
    { orphanRemoval: true }
  ) players = new Collection<Player>(this);

  // server only props
  @Property(PROP_SERVER_ONLY()) createdAt = new Date();
  @Property(PROP_SERVER_ONLY()) password: string;

  @Property(PROP_TEMPORARY()) inGame: boolean;

  @Property() username: string;
  @Property() email: string;

  @Property() isGameMaster = false;
  @Property() isTester = false;
  @Property() isSubscribed = false;

  @Property() subscriptionEndsTimestamp = -1;
  @Property() trialEndsTimestamp = -1;

  // TODO: shared lockers and bank should be properties of account (bank needs region separators)

}
