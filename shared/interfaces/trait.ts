import { Stat } from './building-blocks';

export interface ITrait {
  name: string;                                 // the name of the trait
  desc: string;                                 // the trait tree desciption for the trait
  icon: string;                                 // the specific icon for the trait
  iconColor: string;                            // the icon color for the trait
  borderColor?: string;                         // the border color for the trait (used for skills to specify their type, usually)

  isAncient?: boolean;                          // whether or not the trait is an AP taking trait
  valuePerTier?: number;                        // how much "value" the trait gives per tier. DeathGrip is 10, for example
  statsGiven?: Partial<Record<Stat, number>>;   // the stats given from the trait (used when calculating stats)
  spellGiven?: string;                          // the spell learned from the trait
}
