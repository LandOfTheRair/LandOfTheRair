
import { BaseEntity } from '../../helpers/core/db/base/BaseEntity';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { IGround } from '../../interfaces';

@Entity()
export class Ground extends BaseEntity {

  @Property() map: string;
  @Property() ground: IGround;

}
