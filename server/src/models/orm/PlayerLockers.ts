
import { Entity, Property } from '../../helpers/core/db/decorators';
import { IItemContainer, ICharacterLockers } from '../../interfaces';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class PlayerLockers extends BaseEntity implements ICharacterLockers {

  // relation props

  // other props
  @Property() lockers: Record<string, IItemContainer>;

}
