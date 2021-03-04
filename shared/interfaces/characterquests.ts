import { Stat } from './building-blocks';


export interface ICharacterQuests {
  activeQuestProgress: Record<string, any>;
  permanentQuestCompletion: Record<string, boolean>;
  npcDailyQuests: Record<string, number>;
  questStats: Partial<Record<Stat, number>>;
  questKillWatches: Record<string, string>;
}
