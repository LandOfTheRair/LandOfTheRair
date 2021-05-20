import { ISilverPerk } from './accountpremium';
import { Allegiance, Currency, Stat } from './building-blocks';
import { DynamicEventRarity } from './dynamicevent';

export interface IWeaponTier {
  damage: number[];
  variance: { min: number; max: number };
  scaling: number[];
  bonus: number[];
  weakPercent: number;
  strongPercent: number;
}

export interface IMaterialSlotLayout {
  slots: Record<string, { items: string[]; sprite: number; withdrawInOunces?: boolean }>;
  layouts: Array<{ category: string; items: Array<string|null> }>;
}

export interface IFate {
  stat: Array<{
    chance: number;
    result: {
      stat: Stat;
      divisor: number;
      goodmessage: string;
      antimessage: string;
    };
  }>;

  event: Array<{
    chance: number;
    result: {
      message: string;
      stats?: Partial<Record<Stat, number>>;
      effect?: { name: string; duration: number; potency: number };
      allegiance?: Allegiance;
      sex?: 'male' | 'female';
      currency?: Partial<Record<Currency, number>>;
      xp?: number;
      megaXp?: boolean;
      statBoost?: number;
      unlearnSpell?: string;
      learnSpell?: string;
    };
  }>;
}

export interface IGameSettings {

  auth: {
    verificationHourExpiration: number;
  };

  character: {
    maxLevel: number;
    maxSkill: number;
    maxStats: number;
    chaSlidingDiscount: number;
    defaultMove: number;
    defaultCasterMPRegen: number;
    thiefOOCRegen: number;
    thiefICRegen: number;
    warriorOOCRegen: number;
    warriorICRegen: number;
    warriorHitRegen: number;
    warriorDodgeRegen: number;
    thiefStealthMultiplier: number;
    stealthEncumberDivisor: number;
    thiefLockpickFuzz: number;
    sellValuePercent: number;
    sellChaBaseBoost: number;
    sellChaBaseDivisor: number;
    fallDamagePercent: number;
  };

  combat: {
    buildUpDecay: number;
    buildUpStart: number;
    buildUpMax: number;
    buildUpScale: number;
    cstunConMultiplier: number;
    offhandDamageReduction: number;
    resourceConditionDamage: number;
  };

  corpse: {
    playerExpire: number;
    npcExpire: number;
    rotStrLossChance: number;
    rotAgiLossChance: number;
    eatXpLossMultiplier: number;
    eatSkillLossMultiplier: number;
  };

  event: Record<DynamicEventRarity, number>;

  ground: {
    saveTicks: number;
    expireTicks: number;
  };

  npcgen: {
    attrMult: number;
    eliteMult: number;
    levelFuzz: number;
    eliteLootMult: number;
    normalLootMult: number;
  };

  players: {
    saveTicks: number;
  };

  potion: Record<string, number>;

  skillgain: {
    one: number[];
    two: number[];
    three: number[];
    four: number[];
  };

  subscriber: {
    characters: number;
    smithRepair: number;
    smithCost: number;
    alchemistOz: number;
    statDoc: number;
    succorOz: number;
    marketListings: number;
    storageSpace: number;
    axpGain: number;
    xpGain: number;
    skillGain: number;
    holidayTokenGain: number;
  };

  tradeskill: {
    validTradeskills: string[];
  };
}

export interface IStripePurchase {
  key: string;
  price: number;
  silver: number;
  duration?: number;
  percentOverAverage: number;
}

export interface IPremium {
  silverTiers: {
    microtransaction: IStripePurchase[];
    subscription: IStripePurchase[];
  };

  silverPurchases: ISilverPerk[];
}
