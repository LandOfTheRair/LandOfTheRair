import type { IAccount, IPlayer } from '@lotr/interfaces';
import { SubscriptionTier } from '@lotr/interfaces';

export function isSubscribed(account: IAccount): boolean {
  return (
    account.isGameMaster ||
    account.isTester ||
    (account.premium?.subscriptionTier ?? SubscriptionTier.None) >
      SubscriptionTier.None
  );
}

export function isAtLeastTester(player: IPlayer): boolean {
  return player.isGM || player.isTester;
}
