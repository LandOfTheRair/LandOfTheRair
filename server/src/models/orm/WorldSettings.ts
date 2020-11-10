
import { BaseEntity } from '../../helpers/core/db/base/BaseEntity';
import { Entity, Property } from '../../helpers/core/db/decorators';

@Entity()
export class WorldSettings extends BaseEntity {

  @Property() motd = '';

}
