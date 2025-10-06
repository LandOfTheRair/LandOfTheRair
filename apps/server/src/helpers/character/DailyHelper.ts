import { Injectable } from 'injection-js';
import { DateTime } from 'luxon';

import type { IPlayer, ISimpleItem } from '@lotr/interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class DailyHelper extends BaseService {
  public get resetTime(): DateTime {
    const dailyResetHour =
      this.game.contentManager.getGameSetting('timers', 'dailyResetHour') ?? 12;
    let theoreticalResetTime = DateTime.fromObject({
      zone: 'utc',
      hour: dailyResetHour,
    });
    if (+theoreticalResetTime < +DateTime.fromObject({ zone: 'utc' })) {
      theoreticalResetTime = theoreticalResetTime.plus({ days: 1 });
    }

    return theoreticalResetTime;
  }

  public init() {}

  private canDailyActivate(checkTimestamp: number): boolean {
    const dailyResetHour =
      this.game.contentManager.getGameSetting('timers', 'dailyResetHour') ?? 12;
    let theoreticalResetTime = DateTime.fromObject({
      zone: 'utc',
      hour: dailyResetHour,
    });
    if (+theoreticalResetTime > +DateTime.fromObject({ zone: 'utc' })) {
      theoreticalResetTime = theoreticalResetTime.minus({ days: 1 });
    }

    return checkTimestamp < +theoreticalResetTime;
  }

  public isDailyItem(item: ISimpleItem): boolean {
    return item.uuid?.includes('daily');
  }

  public canBuyDailyItem(player: IPlayer, item: ISimpleItem): boolean {
    if (!this.isDailyItem(item)) {
throw new Error(
        'Attempting to buy item as a daily item ' + JSON.stringify(item),
      );
}

    if (!player.dailyItems[item.uuid]) return true;
    if (this.canDailyActivate(player.dailyItems[item.uuid])) return true;

    return false;
  }

  public canDoDailyQuest(player: IPlayer, questGiverName: string): boolean {
    player.quests.npcDailyQuests = player.quests.npcDailyQuests || {};
    if (!player.quests.npcDailyQuests[questGiverName]) return true;
    if (this.canDailyActivate(player.quests.npcDailyQuests[questGiverName])) {
return true;
}

    return false;
  }

  public buyDailyItem(player: IPlayer, item: ISimpleItem) {
    player.dailyItems = player.dailyItems || {};
    player.dailyItems[item.uuid] = +DateTime.fromObject({ zone: 'utc' });
  }

  public finishDailyQuest(player: IPlayer, questGiverName: string) {
    player.quests.npcDailyQuests = player.quests.npcDailyQuests || {};
    player.quests.npcDailyQuests[questGiverName] = +DateTime.fromObject({
      zone: 'utc',
    });
  }
}
