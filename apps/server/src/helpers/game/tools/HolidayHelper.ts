import { Injectable } from 'injection-js';

import { coreHolidayDescs } from '@lotr/content';
import { gainCurrency } from '@lotr/currency';
import type { Holiday, IPlayer } from '@lotr/interfaces';
import { Currency } from '@lotr/interfaces';
import { premiumHolidayTokensGained } from '@lotr/premium';
import { BaseService } from '../../../models/BaseService';

@Injectable()
export class HolidayHelper extends BaseService {
  private holidayHash;

  public init() {
    this.holidayHash = coreHolidayDescs();
  }

  isHoliday(hol: Holiday): boolean {
    if (!this.holidayHash || !this.holidayHash[hol]) return false;
    return new Date().getMonth() === this.holidayHash[hol].month;
  }

  isAnyHoliday(): boolean {
    return Object.keys(this.holidayHash)
      .map((hol) => this.isHoliday(hol as Holiday))
      .some(Boolean);
  }

  currentHoliday(): Holiday {
    let holiday = '';

    // we do this in case we have sub-holidays, ie, new years is the last week of christmas (for example)
    Object.keys(this.holidayHash).forEach((checkHoliday) => {
      if (!this.isHoliday(checkHoliday as Holiday)) return;
      holiday = checkHoliday;
    });

    return holiday as Holiday;
  }

  tryGrantHolidayTokens(player: IPlayer, amt: number): void {
    if (!this.isAnyHoliday() || !Currency[this.currentHoliday()]) return;

    const tokensGained = premiumHolidayTokensGained(player, amt);

    gainCurrency(player, tokensGained, Currency[this.currentHoliday()]);
    this.game.messageHelper.sendSimpleMessage(
      player,
      `You also earned ${tokensGained} ${Currency[this.currentHoliday()]}!`,
    );
  }
}
