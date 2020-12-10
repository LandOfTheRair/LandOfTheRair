
import { ObjectId } from 'mongodb';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { Currency, IAccountBank } from '../../interfaces';
import { BaseEntity, PROP_SERVER_ONLY } from '../BaseEntity';

@Entity()
export class AccountBank extends BaseEntity implements IAccountBank {

  // relation props
  @Property(PROP_SERVER_ONLY()) _account: ObjectId;

  @Property() deposits: Partial<Record<Currency, number>> = {};
}
