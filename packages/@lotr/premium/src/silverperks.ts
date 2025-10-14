import { settingGameGet } from '@lotr/content';
import { SilverPurchase, type IAccount, type IPlayer } from '@lotr/interfaces';

export function premiumDocReduction(player: IPlayer, baseValue = 10): number {
  const mult = settingGameGet('subscriber', 'statDoc') ?? 0.05;
  return Math.max(
    1,
    Math.floor(baseValue - baseValue * mult * player.subscriptionTier),
  );
}

export function premiumMaxCharacters(account: IAccount, baseValue = 4): number {
  const mult = settingGameGet('subscriber', 'characters') ?? 1;
  return (
    baseValue +
    mult *
      (account?.premium.silverPurchases?.[SilverPurchase.MoreCharacters] ?? 0)
  );
}

export function premiumSmithMaxRepair(
  player: IPlayer,
  baseValue = 20000,
): number {
  const mult = settingGameGet('subscriber', 'smithRepair') ?? 1000;
  return baseValue + player.subscriptionTier * mult;
}

export function premiumSmithRepairCost(
  player: IPlayer,
  repairCost: number,
): number {
  const mult = settingGameGet('subscriber', 'smithCost') ?? 0.05;
  return Math.floor(repairCost - repairCost * mult * player.subscriptionTier);
}

export function premiumSuccorOzMax(player: IPlayer, baseValue = 1): number {
  const mult = settingGameGet('subscriber', 'succorOz') ?? 1;
  return baseValue + player.subscriptionTier * mult;
}

export function premiumMarketListingsMax(
  player: IPlayer,
  baseValue = 25,
): number {
  const mult = settingGameGet('subscriber', 'marketListings') ?? 5;
  return baseValue + player.subscriptionTier * mult;
}

export function premiumAxpGained(player: IPlayer, baseValue = 1): number {
  const mult = settingGameGet('subscriber', 'axpGain') ?? 1;
  return baseValue * (player.subscriptionTier > 0 ? 1 + mult : 1);
}

export function premiumXpGained(player: IPlayer, baseValue = 1): number {
  const mult = settingGameGet('subscriber', 'xpGain') ?? 0.05;
  return baseValue + (1 + player.subscriptionTier * mult);
}

export function premiumSkillGained(player: IPlayer, baseValue = 1): number {
  const mult = settingGameGet('subscriber', 'skillGain') ?? 0.05;
  return baseValue + (1 + player.subscriptionTier * mult);
}

export function premiumBuildSlots(player: IPlayer, baseValue = 3): number {
  const bonusSlots = settingGameGet('subscriber', 'buildSlots') ?? 3;
  return baseValue + bonusSlots;
}

export function premiumHolidayTokensGained(
  player: IPlayer,
  baseValue = 1,
): number {
  const mult = settingGameGet('subscriber', 'holidayTokenGain') ?? 2;
  return baseValue * (player.subscriptionTier > 0 ? mult : 1);
}
