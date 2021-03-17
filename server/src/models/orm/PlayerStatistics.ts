
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseClass, ICharacterStatistics, TrackedStatistic } from '../../interfaces';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class PlayerStatistics extends BaseEntity implements ICharacterStatistics {

  // relation props

  // other props
  @Property() statistics: Partial<Record<TrackedStatistic, number>> = {};
  @Property() baseClass: BaseClass;
  @Property() name: string;
  @Property() level: number;
  @Property() xp: number;

}
