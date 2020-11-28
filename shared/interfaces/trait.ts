import { Stat } from './building-blocks';

export interface ITrait {
  name: string;
  desc: string;
  icon: string;
  iconColor: string;
  borderColor: string;

  isAncient?: boolean;
  valuePerTier?: number;
  statsGiven?: Partial<Record<Stat, number>>;
  spellGiven?: string;
}
