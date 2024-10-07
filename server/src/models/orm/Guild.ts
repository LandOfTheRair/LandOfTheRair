import { IGuild, IGuildMember } from '../../../../shared/interfaces';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class Guild extends BaseEntity implements IGuild {
  @Property() name: string;
  @Property() tag: string;

  @Property() motd: string;

  @Property() treasury: number;
  @Property() level: number;

  @Property() members: Record<string, IGuildMember>;
}
