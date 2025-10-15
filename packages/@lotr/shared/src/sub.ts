import { SubscriptionTier, type IAccount } from '@lotr/interfaces';

export function isSubscribed(account: IAccount): boolean {
  return (
    account.isGameMaster ||
    account.isTester ||
    (account.premium?.subscriptionTier ?? SubscriptionTier.None) >
      SubscriptionTier.None
  );
}
