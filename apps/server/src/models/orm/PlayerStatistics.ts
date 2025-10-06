import type {
  BaseClass,
  ICharacterStatistics,
  TrackedStatistic,
} from '@lotr/interfaces';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class PlayerStatistics
  extends BaseEntity
  implements ICharacterStatistics {
  // relation props

  // other props
  @Property() statistics: Partial<Record<TrackedStatistic, number>> = {};
  @Property() baseClass: BaseClass;
  @Property() name: string;
  @Property() level: number;
  @Property() xp: number;
  @Property() charSlot: number;
  @Property() username: string;
}
