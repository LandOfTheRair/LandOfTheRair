
import { Injectable } from 'injection-js';

import { BaseService, IAccount, isSubscribed } from '../../interfaces';

@Injectable()
export class SubscriptionHelper extends BaseService {

  public init() {}

  public isSubscribed(account: IAccount): boolean {
    return isSubscribed(account);
  }
}
