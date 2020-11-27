
import { BaseEntity } from '../../helpers/core/db/base/BaseEntity';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { ICharacterTraits } from '../../interfaces';

@Entity()
export class PlayerTraits extends BaseEntity implements ICharacterTraits {

  // other props
  @Property() tp = 0;
  @Property() traitsLearned: Record<string, number> = {};

}
