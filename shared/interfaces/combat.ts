import { DamageClass, ItemSlot } from './building-blocks';
import { ISimpleItem } from './item';
import { SoundEffect } from './sfx';
import { ISpellData } from './spell';

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

export enum VisualEffect {
  FireFloor = 0,
  IceMist = 1,
  WaterPool = 2,
  FireMist = 3,
  DustMist = 4,
  SnowFloor = 5,
  IceStorm = 6,
  SludgeFloor = 7
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

export interface PhysicalAttackReturn {
  isDead?: boolean;
  dodge?: boolean;
  block?: boolean;
  blockedBy?: string;
  noDamage?: boolean;
  hit?: boolean;
  damage?: number;
  damageType?: DamageClass;
}

export interface MagicalAttackArgs {
  spellData?: ISpellData;

  atkMsg?: string;
  defMsg?: string;
  damage?: number;
  damageClass?: DamageClass;
  isOverTime?: boolean;
  isAoE?: boolean;
  sfx?: SoundEffect;
}

export interface DamageArgs {
  damage: number;
  damageClass: DamageClass;
  isMelee?: boolean;
  attackerDamageMessage?: string;
  defenderDamageMessage?: string;
  attackerWeapon?: ISimpleItem;
  isRanged?: boolean;
  isOverTime?: boolean;
  isHeal?: boolean;
  isWeak?: boolean;
  isStrong?: boolean;
  isAttackerVisible?: boolean;
  customSfx?: SoundEffect;
  hasBeenReflected?: boolean;
}
