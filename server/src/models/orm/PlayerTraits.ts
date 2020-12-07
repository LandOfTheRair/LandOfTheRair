
import { Entity, Property } from '../../helpers/core/db/decorators';
import { ICharacterTraits } from '../../interfaces';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class PlayerTraits extends BaseEntity implements ICharacterTraits {

  // other props
  @Property() tp = 0;
  @Property() ap = 0;
  @Property() traitsLearned: Record<string, number> = {};

}
