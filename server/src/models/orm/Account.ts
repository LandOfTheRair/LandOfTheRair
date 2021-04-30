

import { Entity, Property } from '../../helpers/core/db/decorators';
import { IAccount, IAccountPremium, IPlayer } from '../../interfaces';
import { BaseEntity, PROP_SERVER_ONLY, PROP_TEMPORARY, PROP_UNSAVED_SHARED } from '../BaseEntity';

@Entity()
export class Account extends BaseEntity implements IAccount {

  // server only props
  @Property(PROP_SERVER_ONLY()) password: string;

  @Property(PROP_TEMPORARY()) players: IPlayer[];
  @Property(PROP_TEMPORARY()) inGame: boolean;
  @Property(PROP_TEMPORARY()) temporaryPassword: string;
  @Property(PROP_TEMPORARY()) verificationCode: string;

  @Property(PROP_UNSAVED_SHARED()) premium: IAccountPremium;

  @Property() username: string;
  @Property() originalEmail: string;
  @Property() email: string;
  @Property() emailVerified = false;

  @Property() isGameMaster = false;
  @Property() isTester = false;

  @Property() isMuted = false;
  @Property() isBanned = false;

  @Property() discordTag: string;
  @Property() alwaysOnline = false;
  @Property() eventWatcher = false;

}
