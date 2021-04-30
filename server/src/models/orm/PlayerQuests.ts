
import { Entity, Property } from '../../helpers/core/db/decorators';
import { ICharacterQuests, Stat } from '../../interfaces';
import { BaseEntity, PROP_TEMPORARY, PROP_UNSAVED_SHARED } from '../BaseEntity';

@Entity()
export class PlayerQuests extends BaseEntity implements ICharacterQuests {

  // other props
  @Property() activeQuestProgress: Record<string, any> = {};
  @Property() permanentQuestCompletion: Record<string, boolean> = {};

  @Property(PROP_UNSAVED_SHARED()) npcDailyQuests: Record<string, number> = {};

  @Property(PROP_TEMPORARY()) questStats: Partial<Record<Stat, number>> = {};
  @Property(PROP_TEMPORARY()) questKillWatches: Record<string, string[]> = {};

}
