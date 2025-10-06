import type { ICharacterLockers, IItemContainer } from '@lotr/interfaces';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class PlayerLockers extends BaseEntity implements ICharacterLockers {
  // relation props

  // other props
  @Property() lockers: Record<string, IItemContainer>;
}
