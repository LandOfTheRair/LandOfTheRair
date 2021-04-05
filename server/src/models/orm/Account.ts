

import { Entity, Property } from '../../helpers/core/db/decorators';
import { IAccount, IAccountPremium, IPlayer } from '../../interfaces';
import { BaseEntity, PROP_SERVER_ONLY, PROP_TEMPORARY, PROP_UNSAVED_SHARED } from '../BaseEntity';

@Entity()
export class Account extends BaseEntity implements IAccount {

  @Property(PROP_SERVER_ONLY()) players: IPlayer[];

  // server only props
  @Property(PROP_SERVER_ONLY()) password: string;

  @Property(PROP_TEMPORARY()) inGame: boolean;
  @Property(PROP_UNSAVED_SHARED()) premium: IAccountPremium;

  @Property() username: string;
  @Property() email: string;

  @Property() isGameMaster = false;
  @Property() isTester = false;

  @Property() isMuted = false;
  @Property() isBanned = false;

  @Property() discordTag: string;
  @Property() alwaysOnline = false;
  @Property() eventWatcher = false;

}
