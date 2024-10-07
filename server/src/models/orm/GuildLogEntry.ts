import { ObjectId } from 'mongodb';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class GuildLogEntry extends BaseEntity {
  @Property() guildId: ObjectId;
  @Property() action: string;
  @Property() actor: string;
}
