import { Injectable } from 'injection-js';

import { currentHoliday, isAnyHoliday } from '@lotr/content';
import { gainCurrency } from '@lotr/currency';
import type { IPlayer } from '@lotr/interfaces';
import { Currency } from '@lotr/interfaces';
import { premiumHolidayTokensGained } from '@lotr/premium';
import { BaseService } from '../../../models/BaseService';

@Injectable()
export class HolidayHelper extends BaseService {
  public init() {}

  tryGrantHolidayTokens(player: IPlayer, amt: number): void {
    if (!isAnyHoliday() || !Currency[currentHoliday()]) return;

    const tokensGained = premiumHolidayTokensGained(player, amt);

    gainCurrency(player, tokensGained, Currency[currentHoliday()]);
    this.game.messageHelper.sendSimpleMessage(
      player,
      `You also earned ${tokensGained} ${Currency[currentHoliday()]}!`,
    );
  }
}
