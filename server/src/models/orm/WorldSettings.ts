
import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity()
export class WorldSettings extends BaseEntity {

  @Property() motd = '';

}
