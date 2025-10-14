import { settingGameGet } from '@lotr/content';
import type { IPlayer } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { premiumDocReduction } from '@lotr/premium';
import { getBaseStat, getStat } from './stats';

// calculate the gold required for the stat doc
export function playerCalcRequiredGoldForNextHPMP(
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
  const discountPercent = Math.min(chaMaxForDiscount, cha - chaSlidingDiscount);
  const percentThere = Math.max(0.01, (curHp - normal) / (maxForTier - normal));

  const { min, max } = costsAtTier;

  const totalCost = min + (max - min) * percentThere;
  const totalDiscount = (totalCost * discountPercent) / 100;

  return premiumDocReduction(
    player,
    Math.max(min, Math.round(totalCost - totalDiscount)),
  );
}
