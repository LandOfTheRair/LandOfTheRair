import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class LogEntry extends BaseEntity {
  @Property() timestamp: number;
  @Property() message: string;
  @Property() extraData: any;
}
