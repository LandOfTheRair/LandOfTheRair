import type { IGuild, IGuildMember } from '@lotr/interfaces';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class Guild extends BaseEntity implements IGuild {
  @Property() timestamp: number;

  @Property() name: string;
  @Property() tag: string;

  @Property() motd: string;

  @Property() treasury: number;
  @Property() level: number;

  @Property() members: Record<string, IGuildMember>;
}
