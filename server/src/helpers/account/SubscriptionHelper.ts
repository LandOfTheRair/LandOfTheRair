
import { Injectable } from 'injection-js';

import { IAccount, IPlayer, isSubscribed } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class SubscriptionHelper extends BaseService {

  public init() {}

  public isSubscribed(account: IAccount): boolean {
    return isSubscribed(account);
  }

  public isPlayerSubscribed(player: IPlayer): boolean {
    return player.isSubscribed;
  }

  public maxSmithRepair(player: IPlayer, baseValue = 20000): number {
    return baseValue;
  }

  public smithRepairCost(player: IPlayer, repairCost: number): number {
    return repairCost;
  }

  public maxAlchemistOz(player: IPlayer, baseValue = 10): number {
    return baseValue;
  }

  public maxSuccorOz(player: IPlayer, baseValue = 1): number {
    return baseValue;
  }
}
