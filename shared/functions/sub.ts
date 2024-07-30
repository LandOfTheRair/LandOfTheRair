import { IAccount, IPlayer, SubscriptionTier } from '../interfaces';

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
