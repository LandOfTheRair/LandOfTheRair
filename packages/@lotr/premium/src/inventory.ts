import type { IAccount } from '@lotr/interfaces';
import { SilverPurchase } from '@lotr/interfaces';

export function getSilverCosmetics(account: IAccount) {
  return {
    inversify:
      account.premium.silverPurchases[SilverPurchase.CosmeticInversify],
    ancientify:
      account.premium.silverPurchases[SilverPurchase.CosmeticAncientify],
    etherpulse:
      account.premium.silverPurchases[SilverPurchase.CosmeticEtherPulse],
    ghostether:
      account.premium.silverPurchases[SilverPurchase.CosmeticGhostEther],
  };
}
