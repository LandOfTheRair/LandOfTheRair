import { Stat } from './building-blocks';


export interface ICharacterQuests {
  activeQuestProgress: Record<string, any>;
  permanentQuestCompletion: Record<string, boolean>;
  questStats: Partial<Record<Stat, number>>;
  questKillWatches: Record<string, string>;
}
