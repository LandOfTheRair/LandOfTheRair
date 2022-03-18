import { ISilverPerk } from './accountpremium';
import { Allegiance, BaseClass, Currency, Stat } from './building-blocks';
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
    chaMaxForDiscount: number;
    defaultMove: number;
    maxMove: number;
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
    defaultInvulnDuration: number;
    rotStatThreshold: number;
    lowCONHPLossThreshold: number;
    axpRewardThreshold: number;
    skillActiveTicks: number;
    thiefBonusMultiplier: number;
    goldStealDifficulty: number;
    itemStealDifficulty: number;
    stealSkillLower: number;
    stealSkillUpper: number;
    stealLevelRangeForSkillGain: number;

    creation: {
      baseMP: Record<BaseClass, number>;
      learnedTraits: Record<BaseClass, string>;
    };

    levelup: Record<BaseClass, {
      hp: {
        base: number;
        randomConDivisor: number;
        bonusConDivisor: number;
        randomConBonusMultiplier: number;
      };

      mp: {
        base: number;
        randomMultiplier: number;
        randomDivisor: number;
      };
    }>;

  };

  combat: {
    buildUpDecay: number;
    buildUpStart: number;
    buildUpMax: number;
    buildUpScale: number;
    cstunConMultiplier: number;
    offhandDamageReduction: number;
    resourceConditionDamage: number;
    npcViolenceMultiplier: number;
    magicCriticalMultiplier: number;
    willSaveThresholdDefault: number;
    willSavePercentDefault: number;
    strongAttackBaseChance: number;
    weakAttackLuckReduction: number;
    attackVarianceBaseBonusRolls: number;
    attackVarianceStrongBonusRolls: number;
    skillDivisor: number;
    damageStatDivisor: number;
    defenseDexDivisor: number;
    defenseOffhandSkillDivisor: number;
    dodgeBonusDivisor: number;
    defenderBlockBonus: number;
    attackerAttackBonus: number;
    levelDifferenceRange: number;
    levelDifferenceMultiplier: number;
    mitigationMax: number;
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

  item: {
    conditionThresholds: {
      broken: number;
      rough: number;
      tattered: number;
      belowAverage: number;
      average: number;
      aboveAverage: number;
      mint: number;
      aboveMint: number;
      perfect: number;
      heavenly: number;
    };

    conditionACMods: {
      broken: number;
      rough: number;
      tattered: number;
      belowAverage: number;
      average: number;
      aboveAverage: number;
      mint: number;
      aboveMint: number;
      perfect: number;
      heavenly: number;
    };
  };

  map: {
    xpMultiplier: {
      uncut: number;
      firstSoftCut: number;
      secondSoftCut: number;
      hardCut: number;
      unknown: number;
    };

    defaultRespawnPoint: {
      map: string;
      x: number;
      y: number;
    };
  };

  npc: {
    messages: {
      hostile: string[];
      beast: string[];
      friendly: string[];
    };
  };

  npcgen: {
    attrMult: number;
    eliteMult: number;
    levelFuzz: number;
    levelFuzzMinLevel: number;
    eliteLootMult: number;
    normalLootMult: number;
    eliteLevelBonusDivisor: number;

    potionDrops: Record<string, Record<string, number>>;
  };

  npcscript: {
    trainer: {
      assessCost: number;
      trainCost: number;
      resetCost: number;
    };

    steelrose: {
      maxListings: number;
    };

    mpdoc: {
      levels: number[];
      normalizers: number[];
      costs: Array<{ min: number; max: number }>;
      values: Record<BaseClass, number[]>;
    };

    hpdoc: {
      levels: number[];
      normalizers: number[];
      costs: Array<{ min: number; max: number }>;
      values: Record<BaseClass, number[]>;
    };

    buffer: {
      duration: number;
      buffs: string[];
    };

    axpswapper: {
      level: number;
    };

  };

  spell: {
    dazedDivisor: number;
    encumberedDivisor: number;
    skillGainedPerCast: number;
    skillGainedPerAOECast: number;
  };

  timers: {
    dailyResetHour: number;
    saveTicks: number;
  };

  inventory: {
    sackSize: number;
    beltSize: number;
    pouchSize: number;
    lockerSize: number;
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
