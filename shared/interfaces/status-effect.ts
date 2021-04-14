import { Stat } from './building-blocks';
import { DamageType } from './itemtypes';
import { SoundEffect } from './sfx';


export interface IStatusEffectInfo {
  potency: number;                              // the potency of the effect (used to overwrite if necessary)

  canRemove?: boolean;                          // if the effect can be manually unapplied
  damage?: number;                              // the amount of damage this effect does per tick
  damageType?: DamageType;                      // the type of damage this effect does
  currentTick?: number;                         // the current tick of the effect
  statChanges?: Partial<Record<Stat, number>>;  // the stat boosts for this effect
  effectIcon?: string;                          // an override of the icon for the effect
  tooltip?: string;                             // the tooltip for the item effect
  tooltipColor?: string;                        // the tooltip color to override for the effect
  message?: string;                             // the message sent for the item effect
  persistThroughDeath?: boolean;                // whether the effect should persist through death or not
  hidden?: boolean;                             // whether or not the effect should be hidden on the client side
  unique?: boolean|string;                      // whether or not this effect is unique (ie, can have duplicates of) - if string, similar effects will be removed (imbue, stance)
  disableMessages?: boolean;                    // whether or not to disable apply/unapply messages
  disableRecently?: boolean;                    // whether or not to disable recently effects

  charges?: number;                             // the number of charges this effect has remaining

  buildUpMax?: number;                          // the max buildup value required for this to burst
  buildUpCurrent?: number;                      // the current buildup value
  buildUpDecay?: number;                        // the decay value for the buildup

  isContagious?: boolean;                       // if this effect is contagious and spreads to nearby creatures (Plague)
  isFrozen?: boolean;                           // if you're currently frozen from the effect (Stun, Chill)
  enrageTimer?: number;                         // the enrage timer associated with this effect (Mood)
  startTimer?: number;                          // when this effect starts (Mood)
  currentMood?: number;                         // the current mood associated with this effect (Mood)
  tier?: string;                                // the tier of the effect (used for stat potions)
  summonCreatures?: string[];                   // the creature summoned by this effect (FindFamiliar)
  unableToShred?: boolean;                      // whether or not the effect can be shredded (Attribute)
  usedWeapon?: string;                          // the weapon used for this effect (Warrior Stance)
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
    icon: string;                 // the icon for the tooltip
  };

  effect: {
    type: 'buff'|'debuff'|'outgoing'|'incoming'|'useonly';
    duration: number;             // the default duration for the effect (-1 = permanent)
    extra: IStatusEffectInfo;     // the static meta information
  };

  effectMeta: {
    castSfx?: SoundEffect;        // the sound effect sent to the caster when the effect starts
    applySfx?: SoundEffect;       // the sound effect sent to the creature when the effect starts

    castMessage?: string;         // the message sent to the caster when the effect starts
    applyMessage?: string;        // the message sent to the creature when the effect starts
    unapplyMessage?: string;      // the message sent to the creature when the effect ends
    effectRef?: string;           // the string reference to the effect code, if needed
    recentlyRef?: string;         // the "recently" effect for this effect. if exists on the target, effectRef cannot be applied. automatically applied when effectRef fades.
  };
}
