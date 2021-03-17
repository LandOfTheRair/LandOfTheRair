
import { IAccount, SubscriptionTier } from '../interfaces';

export function isSubscribed(account: IAccount): boolean {
  return account.isGameMaster || account.isTester || (account.premium?.subscriptionTier ?? SubscriptionTier.None) > SubscriptionTier.None;
}
