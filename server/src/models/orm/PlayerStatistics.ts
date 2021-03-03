
import { Entity, Property } from '../../helpers/core/db/decorators';
import { ICharacterStatistics, TrackedStatistic } from '../../interfaces';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class PlayerStatistics extends BaseEntity implements ICharacterStatistics {

  // relation props

  // other props
  @Property() statistics: Partial<Record<TrackedStatistic, number>> = {};

}
