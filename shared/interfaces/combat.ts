import { DamageClass, ItemSlot } from './building-blocks';
import { SoundEffect } from './sfx';

export enum CombatEffect {
  BlockMiss = 'block-miss',
  BlockArmor = 'block-armor',
  BlockWeapon = 'block-weapon',
  BlockShield = 'block-shield',
  BlockOffhand = 'block-offhand',
  HitWeak = 'hit-min',
  HitNormal = 'hit-mid',
  HitStrong = 'hit-max',
  HitHeal = 'hit-heal',
  HitMagic = 'hit-magic'
}

export interface OnesidedDamageArgs {
  damage: number;
  damageClass: DamageClass;
  damageMessage: string;
  suppressIfNegative?: boolean;
  overrideSfx?: SoundEffect;
}

export interface PhysicalAttackArgs {
  isPunch?: boolean;
  isKick?: boolean;
  isThrow?: boolean;
  isOffhand?: boolean;
  isMug?: boolean;
  isBackstab?: boolean;
  isCounterAttack?: boolean;
  isAssassinate?: boolean;
  throwHand?: ItemSlot;
  attackRange?: number;
  damageMult?: number;
  accuracyLoss?: number;
  offhandMultiplier?: number;
  backstabIgnoreRange?: boolean;
  attackerName?: string;
  damageClass?: DamageClass;
}
