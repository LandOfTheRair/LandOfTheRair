
import { DamageClass } from './building-blocks';

export interface ISpellData {
  maxSkillForGain: number;              // the max skill we can gain skill points from this spell for
  mpCost: number;                       // the mp cost of the skill

  castTime?: number;                    // the time (in seconds) it takes to channel this spell
  cooldown?: number;                    // the cooldown (in seconds) for recasting this spell
  damageClass?: DamageClass;            // the damage class of the spell
  willSaveThreshold?: number;           // the will save threshold. will roll (1, defWIL) and if it's >= willSaveThreshold, it saves
  willSavePercent?: number;             // the % damage reduced when will save is met
  potencyMultiplier?: number;           // the overall multiplier to the potency of the skill
  skillMultiplierChanges?: number[][];  // the skill multiplier buffs when you reach a certain skill threshold

  meta: {
    doesAttack?: boolean;               // if the spell does an attack, it calls this first
    casterMessage?: string;             // if the spell sends a message to the caster, it sends this if the caster is NOT the target
    casterAttackMessage?: string;       // if the spell does an attack, this is the unformatted message to send to the caster
    casterSfx?: string;                 // if the spell attacks or sends the caster a message, it uses this SFX
    targetMessage?: string;             // if the spell sends a message to the target, it sends this
    targetAttackMessage?: string;       // if the spell does an attack, this is the unformatted message to send to the caster
    targetSfx?: string;                 // if the spell does NOT attack, this is the SFX it sends along with targetMessage
    spellRef: string;                   // the reference to the spell for casting purposes
  };

}
