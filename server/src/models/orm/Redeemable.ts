import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class Redeemable extends BaseEntity {
  @Property() timestamp: number;

  @Property() code: string;
  @Property() forAccountName: string;
  @Property() maxUses: number;
  @Property() expiresAt: number;

  @Property() claimedBy: string[];

  @Property() gold: number;
  @Property() item: string;
}
