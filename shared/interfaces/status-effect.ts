import { Stat } from './building-blocks';
import { DamageType } from './itemtypes';
import { SoundEffect } from './sfx';


export interface IStatusEffectInfo {
  potency: number;                    // the potency of the effect (used to overwrite if necessary)

  currentTick?: number;               // the current tick of the effect
  statChanges?: Record<Stat, number>; // the stat boosts for this effect
  charges?: number;                   // the number of charges this effect has remaining
  buildUpPercent?: number;            // the percentage 0..100 for this effect before it bursts
  damage?: number;                    // the amount of damage this effect does per tick
  damageType?: DamageType;            // the type of damage this effect does
  isFrozen?: boolean;                 // if you're currently frozen from the effect
  canRemove?: boolean;                // if the effect can be manually unapplied
  persistThroughDeath?: boolean;      // whether the effect should persist through death or not
  enrageTimer?: number;               // the enrage timer associated with this effect
  hidden?: boolean;                   // whether or not the effect should be hidden on the client side
  unique?: boolean;                   // whether or not this effect is unique (ie, can have duplicates of)
  tier?: string;                      // the tier of the effect (used for stat potions)
  tooltip?: string;                   // the tooltip for the item effect
  message?: string;                   // the message sent for the item effect
}

export interface IStatusEffect {
  uuid: string;                   // the unique id for this instance
  sourceName: string;             // the caster name
  effectName: string;             // the effect name
  endsAt: number;                 // the timestamp of when the effect ends
  effectInfo: IStatusEffectInfo;  // the extra info associated with the effect
  effectRef?: string;             // the string name of the effect to hook into

  tooltip?: string;               // the tooltip string for this effect - only needs to be set if it's being overridden
  sourceUUID?: string;            // the uuid of the source caster

}

export interface IStatusEffectData {
  tooltip: {
    name: string;                 // the tooltip effect name
    color: string;                // the foreground color for the icon
    bgColor: string;              // the background color for the icon
    desc: string;                 // the description for the tooltip
  };

  effect: {
    type: 'buff'|'debuff'|'outgoing'|'incoming'|'useonly';
    duration: number;             // the default duration for the effect (-1 = permanent)
    extra: IStatusEffectInfo;     // the static meta information
  };

  meta: {
    castSfx?: SoundEffect;        // the sound effect sent to the caster when the effect starts
    applySfx?: SoundEffect;       // the sound effect sent to the creature when the effect starts

    castMessage?: string;         // the message sent to the caster when the effect starts
    applyMessage?: string;        // the message sent to the creature when the effect starts
    unapplyMessage?: string;      // the message sent to the creature when the effect ends
    effectRef?: string;           // the string reference to the effect code, if needed
  };
}
