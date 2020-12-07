
import { Injectable } from 'injection-js';

import { IAccount, IPlayer, isSubscribed } from '../../interfaces';
import { BaseService } from '../../models';

@Injectable()
export class SubscriptionHelper extends BaseService {

  public init() {}

  public isSubscribed(account: IAccount): boolean {
    return isSubscribed(account);
  }

  public isPlayerSubscribed(player: IPlayer): boolean {
    return player.isSubscribed;
  }
}
