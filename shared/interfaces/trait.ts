import { Stat } from './building-blocks';

export interface ITrait {
  name: string;
  desc: string;
  icon: string;
  iconColor: string;
  borderColor: string;
  
  isAncient?: boolean;
  statsGiven?: Partial<Record<Stat, number>>;
  spellGiven?: string;
}
