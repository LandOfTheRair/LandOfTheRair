
import { DamageClass } from './building-blocks';

export interface ISpellData {
  maxSkillForGain: number;
  mpCost: number;

  damageClass?: DamageClass;
  potencyMultiplier?: number;
  skillMultiplierChanges?: number[][];

  meta: {
    doesAttack?: boolean;
    casterMessage?: string;
    casterAttackMessage?: string;
    casterSfx?: string;
    targetAttackMessage?: string;
    spellRef: string;
  };

}
