
import { ObjectId } from 'mongodb';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity, PROP_SERVER_ONLY } from '../BaseEntity';

@Entity()
export class AccountDaily extends BaseEntity {

  // relation props
  @Property(PROP_SERVER_ONLY()) _account: ObjectId;

  // other props
  @Property() daily: Record<number, any> = {};
}
