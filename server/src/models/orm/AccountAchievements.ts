import { ObjectId } from 'mongodb';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { IAccountAchievements, IEarnedAchievement } from '../../interfaces';
import { BaseEntity, PROP_SERVER_ONLY } from '../BaseEntity';

@Entity()
export class AccountAchievements
  extends BaseEntity
  implements IAccountAchievements
{
  // relation props
  @Property(PROP_SERVER_ONLY()) _account: ObjectId;

  // other props
  @Property() achievements: Record<string, IEarnedAchievement> = {};
}
