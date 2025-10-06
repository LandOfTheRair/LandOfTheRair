import type { ObjectId } from 'mongodb';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class GuildLogEntry extends BaseEntity {
  @Property() timestamp: number;
  @Property() guildId: ObjectId;
  @Property() guildName: string;
  @Property() guildTag: string;
  @Property() action: string;
  @Property() actor: string;
}
