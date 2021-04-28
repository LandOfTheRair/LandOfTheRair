
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class WorldSettings extends BaseEntity {

  @Property() motd = '';
  @Property() running = false;

}
