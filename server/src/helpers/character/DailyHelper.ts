
import { Injectable } from 'injection-js';
import { DateTime } from 'luxon';

import { IPlayer, ISimpleItem } from '../../interfaces';
import { BaseService } from '../../models';


@Injectable()
export class DailyHelper extends BaseService {

  public init() {}

  private canDailyActivate(checkTimestamp: number): boolean {
    let theoreticalResetTime = DateTime.fromObject({ zone: 'utc', hour: 12 });
    if (+theoreticalResetTime > +DateTime.fromObject({ zone: 'utc' })) {
      theoreticalResetTime = theoreticalResetTime.minus({ days: 1 });
    }

    return checkTimestamp < +theoreticalResetTime;
  }

  public isDailyItem(item: ISimpleItem): boolean {
    return item.uuid?.includes('daily');
  }

  public canBuyDailyItem(player: IPlayer, item: ISimpleItem): boolean {
    if (!item.uuid?.includes('daily')) throw new Error('Attempting to buy item as a daily item ' + JSON.stringify(item));

    if (!player.dailyItems[item.uuid]) return true;
    if (this.canDailyActivate(player.dailyItems[item.uuid])) return true;

    return false;
  }

  public buyDailyItem(player: IPlayer, item: ISimpleItem) {
    player.dailyItems = player.dailyItems || {};
    player.dailyItems[item.uuid] = +DateTime.fromObject({ zone: 'utc' });
  }

}
