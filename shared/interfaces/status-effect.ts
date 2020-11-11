import { DamageType } from './itemtypes';

export interface IStatusEffectInfo {
  potency: number;                // the potency of the effect (used to overwrite if necessary)

  charges?: number;               // the number of charges this effect has remaining
  buildUpPercent?: number;        // the percentage 0..100 for this effect before it bursts
  damage?: number;                // the amount of damage this effect does per tick
  damageType?: DamageType;        // the type of damage this effect does
  isFrozen?: boolean;             // if you're currently frozen from the effect
  canManuallyUnapply?: boolean;   // if the effect can be manually unapplied
  enrageTimer?: number;           // the enrage timer associated with this effect
  unique?: boolean;               // whether or not this effect is unique (ie, can have duplicates of)
}

export interface IStatusEffect {
  uuid: string;                   // the unique id for this instance
  sourceName: string;             // the caster name
  effectName: string;             // the effect name
  endsAt: number;                 // the timestamp of when the effect ends
  effectInfo: IStatusEffectInfo;  // the extra info associated with the effect

  tooltip?: string;               // the tooltip string for this effect - only needs to be set if it's being overridden
  sourceUUID?: string;            // the uuid of the source caster

}
