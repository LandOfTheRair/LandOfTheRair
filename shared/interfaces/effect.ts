import { DamageClass, StatBlock } from './building-blocks';
import { IStatusEffect } from './status-effect';

export enum BuffType {
  // buffs. positive effects. generally unique.
  Buff = 'buff',

  // debuffs. negative effects/dots. sometimes unique.
  Debuff = 'debuff',

  // outgoing modifiers. used to modify your own outgoing damage.
  OutgoingModifier = 'outgoing',

  // incoming modifiers. used to modify incoming damage.
  IncomingModifier = 'incoming',
}

export interface IEffectContainer {
  [BuffType.Buff]: IStatusEffect[];
  [BuffType.Debuff]: IStatusEffect[];
  [BuffType.OutgoingModifier]: IStatusEffect[];
  [BuffType.IncomingModifier]: IStatusEffect[];

  // used to check if a character has an effect associated with them
  _hash: Record<string, IStatusEffect>;
}

export interface IItemEffectExtra {
  // the tooltip to be displayed (food)
  tooltip?: string;

  // the message to be sent (food)
  message?: string;

  // the stats given (food)
  statChanges?: StatBlock;
}

export interface IItemEffect {
  name: string;
  potency: number;

  // if true, effect can be applied to a weapon via Apply
  canApply?: boolean;

  // if exists, the % chance the effect will be applied
  chance?: number;

  // if exists, the number of charges the spell will have
  charges?: number;

  // the number of seconds the ability lasts
  duration?: number;

  // the number of uses the ability has left before the item breaks (-1 = infinite)
  uses?: number;

  // the number of tiles for the AoE effect to go (0 = current tile only)
  range?: number;

  // extra data that is used by different items
  extra?: IItemEffectExtra;

  // the damage type for this effect
  damageClass?: DamageClass;
}
