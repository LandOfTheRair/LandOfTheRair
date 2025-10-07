import { Injectable } from 'injection-js';
import { DateTime } from 'luxon';

import { getBaseStat, getStat } from '@lotr/characters';
import { settingGameGet } from '@lotr/content';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IPlayer } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class CalculatorHelper extends BaseService {
  public init() {}

  // get the "seed" for players daily quests
  public getDailyOffset(player: IPlayer): number {
    return player.name.charCodeAt(0);
  }

  // get the day of year
  public getCurrentDailyDayOfYear(player: IPlayer): number {
    const now = DateTime.fromObject({ zone: 'utc' });
    const start = DateTime.fromObject({
      zone: 'utc',
      year: now.year,
      month: 1,
      day: 1,
    });
    const diff = +now - +start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);

    return day + this.getDailyOffset(player);
  }

  // calculate the gold required for the stat doc
  public calcRequiredGoldForNextHPMP(
    player: IPlayer,
    stat: Stat,
    maxForTier: number,
    normalizer: number,
    costsAtTier: { min: number; max: number },
  ) {
    const normal = normalizer;

    const curHp = getBaseStat(player, stat);
    const cha = getStat(player, Stat.CHA);

    // every cha past 7 is +1% discount
    const chaSlidingDiscount =
      settingGameGet('character', 'chaSlidingDiscount') ?? 7;
    const chaMaxForDiscount =
      settingGameGet('character', 'chaMaxForDiscount') ?? 50;
    const discountPercent = Math.min(
      chaMaxForDiscount,
      cha - chaSlidingDiscount,
    );
    const percentThere = Math.max(
      0.01,
      (curHp - normal) / (maxForTier - normal),
    );

    const { min, max } = costsAtTier;

    const totalCost = min + (max - min) * percentThere;
    const totalDiscount = (totalCost * discountPercent) / 100;

    return this.game.subscriptionHelper.docReduction(
      player,
      Math.max(min, Math.round(totalCost - totalDiscount)),
    );
  }

  // calculate axp reward for a creature
  public calcAXPRewardFor(char: ICharacter): number {
    if (hasEffect(char, 'Dangerous')) return 10;
    if (char.name.includes('elite ')) return 5;
    return 1;
  }
}
