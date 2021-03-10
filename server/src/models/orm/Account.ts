

import { Entity, Property } from '../../helpers/core/db/decorators';
import { IAccount, IPlayer } from '../../interfaces';
import { BaseEntity, PROP_SERVER_ONLY, PROP_TEMPORARY } from '../BaseEntity';

@Entity()
export class Account extends BaseEntity implements IAccount {

  @Property(PROP_SERVER_ONLY()) players: IPlayer[];

  // server only props
  @Property(PROP_SERVER_ONLY()) createdAt = new Date();
  @Property(PROP_SERVER_ONLY()) password: string;

  @Property(PROP_TEMPORARY()) inGame: boolean;

  @Property() username: string;
  @Property() email: string;

  @Property() isGameMaster = false;
  @Property() isTester = false;
  @Property() isSubscribed = false;

  @Property() isMuted = false;
  @Property() isBanned = false;

  @Property() subscriptionEndsTimestamp = -1;
  @Property() trialEndsTimestamp = -1;

  @Property() discordTag: string;
  @Property() alwaysOnline = false;
  @Property() eventWatcher = false;

}
