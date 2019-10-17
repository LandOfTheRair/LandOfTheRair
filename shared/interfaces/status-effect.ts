
export interface IStatusEffectInfo {
  damage?: number;
  damageFactor?: number;
  caster: string;
  casterName?: string;
  isPermanent?: boolean;
  isFrozen?: boolean;
  canManuallyUnapply?: boolean;
  enrageTimer?: number;
}

export interface IStatusEffect {
  casterUUID?: string;

  name: string;
  iconData: any;
  endsAt: number;
  charges?: number;
  autocast?: boolean;

  potency: number;
  effectInfo: IStatusEffectInfo;

  shouldNotShowMessage?: boolean;
  hasEnded?: boolean;
}
