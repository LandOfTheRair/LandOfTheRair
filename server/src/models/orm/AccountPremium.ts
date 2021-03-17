
import { ObjectId } from 'mongodb';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { IAccountPremium, SilverPurchase, SubscriptionTier } from '../../interfaces';
import { BaseEntity, PROP_SERVER_ONLY } from '../BaseEntity';

@Entity()
export class AccountPremium extends BaseEntity implements IAccountPremium {

  // relation props
  @Property(PROP_SERVER_ONLY()) _account: ObjectId;

  // other props
  @Property() subscriptionTier: SubscriptionTier;
  @Property() subscriptionEnds: number;
  @Property() hasDoneTrial: boolean;
  @Property() silver: number;
  @Property() silverPurchases: Partial<Record<SilverPurchase, number>> = {};
}
