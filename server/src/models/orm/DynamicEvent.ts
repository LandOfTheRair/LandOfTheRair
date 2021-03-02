
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

import { IDynamicEvent } from '../../interfaces';

@Entity()
export class DynamicEvent extends BaseEntity implements IDynamicEvent {

  @Property() name = '';
  @Property() description = '';
  @Property() endsAt = 0;
  @Property() statBoost = {};
  @Property() extraData = {};

}
