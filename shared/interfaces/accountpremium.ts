import { Stat } from './building-blocks';

export enum SilverPurchase {
  MorePotions = 'MorePotions',
  MoreCharacters = 'MoreCharacters',
  ExpandedMaterialStorage = 'ExpandedMaterialStorage',
  SharedLockers = 'SharedLockers',
  MagicPouch = 'MagicPouch',
  FestivalXP = 'FestivalXP',
  FestivalSkill = 'FestivalSkill',
  CosmeticInversify = 'CosmeticInversify',
  CosmeticAncientify = 'CosmeticAncientify',
  CosmeticEtherPulse = 'CosmeticEtherPulse',
  CosmeticGhostEther = 'CosmeticGhostEther'
}

export enum SubscriptionTier {
  None = 0,
  Trial = 1,
  Basic = 5,
  Tester = 2,
  GM = 10
}

export interface ISilverPerk {
  name: string;
  desc: string;
  icon: string;
  fgColor: string;
  maxPurchases: number;
  key: string | SilverPurchase;
  cost: number;
  festival?: { name: string; stats: Partial<Record<Stat, number>> };
}

export interface IAccountPremium {
  subscriptionTier: SubscriptionTier;
  subscriptionEnds: number;
  hasDoneTrial: boolean;
  silver: number;
  silverPurchases: Partial<Record<SilverPurchase, number>>;
}
