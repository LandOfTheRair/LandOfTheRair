
import { Injectable } from 'injection-js';

import { BaseService, IAccount, IPlayer, isSubscribed } from '../../interfaces';

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
