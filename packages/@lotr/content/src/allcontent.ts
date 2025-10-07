import deepfreeze from 'deep-freeze';

import type {
  Allegiance,
  Holiday,
  IAchievement,
  IChallenge,
  IClassTraitTree,
  IDynamicEventMeta,
  IFate,
  IGameSettings,
  IItemDefinition,
  IMaterialSlotLayout,
  INPCDefinition,
  INPCScript,
  IPremium,
  IQuest,
  IRecipe,
  IRNGDungeonConfig,
  ISpawnerData,
  ISpellData,
  IStatusEffectData,
  ITrait,
  IWeaponTier,
  Rollable,
  Skill,
  Stat,
  WeaponClass,
} from '@lotr/interfaces';

export const __AllContentDontUse: {
  mapDroptables: Record<string, { drops: Rollable[] }>;
  regionDroptables: Record<string, { drops: Rollable[] }>;
  items: Record<string, IItemDefinition>;
  npcs: Record<string, INPCDefinition>;
  npcScripts: Record<string, INPCScript>;
  tradeskillRecipes: Record<string, IRecipe[]>;
  allRecipes: Record<string, IRecipe>;
  spawners: Record<string, ISpawnerData>;
  quests: Record<string, IQuest>;
  traits: Record<string, ITrait>;
  traitTrees: Record<string, IClassTraitTree>;
  effectData: Record<string, IStatusEffectData>;
  spells: Record<string, ISpellData>;
  achievements: Record<string, IAchievement>;
  allegianceStats: Record<Allegiance, Array<{ stat: Stat; value: number }>>;
  attributeStats: Array<{
    attribute: string;
    stats: Array<{ stat: Stat; boost: number }>;
  }>;
  challenge: IChallenge;
  charSelect: {
    baseStats: Record<Stat | 'gold', number>;
    allegiances: any[];
    classes: any[];
    weapons: any[];
  };
  events: Record<string, IDynamicEventMeta>;
  fate: IFate;
  hideReductions: Record<WeaponClass, number>;
  holidayDescs: Record<
    Holiday,
    { name: string; text: string; duration: string; month: number }
  >;
  materialStorage: IMaterialSlotLayout;
  npcNames: string[];
  premium: IPremium;
  rarespawns: Record<string, { spawns: string[] }>;
  settings: IGameSettings;
  skillDescs: Record<Skill, string[]>;
  statDamageMultipliers: Record<Stat, number[]>;
  staticText: { terrain: string[]; decor: Record<string, string> };
  weaponTiers: Record<WeaponClass, IWeaponTier>;
  weaponTiersNPC: Record<WeaponClass, IWeaponTier>;
  rngDungeonConfig: IRNGDungeonConfig;
  spriteinfo: { doorStates: any[] };
} = {
  mapDroptables: {},
  regionDroptables: {},
  items: {},
  npcs: {},
  npcScripts: {},
  tradeskillRecipes: {},
  allRecipes: {},
  spawners: {},
  quests: {},
  traits: {},
  traitTrees: {},
  effectData: {},
  spells: {},
  achievements: {},
  allegianceStats: {} as Record<
    Allegiance,
    Array<{ stat: Stat; value: number }>
  >,
  attributeStats: [],
  challenge: {
    byClass: {} as IChallenge['byClass'],
    global: {} as IChallenge['global'],
    byType: {} as IChallenge['byType'],
  },
  charSelect: {
    baseStats: {} as Record<Stat | 'gold', number>,
    allegiances: [],
    classes: [],
    weapons: [],
  },
  events: {},
  fate: { stat: [], event: [] },
  hideReductions: {} as Record<WeaponClass, number>,
  holidayDescs: {} as Record<
    Holiday,
    { name: string; text: string; duration: string; month: number }
  >,
  materialStorage: { slots: {}, layouts: [] },
  npcNames: [],
  premium: {
    silverPurchases: [],
    silverTiers: { microtransaction: [], subscription: [] },
  },
  rarespawns: {},
  settings: {} as IGameSettings,
  skillDescs: {} as Record<Skill, string[]>,
  statDamageMultipliers: {} as Record<Stat, number[]>,
  staticText: { terrain: [], decor: {} },
  weaponTiers: {} as Record<WeaponClass, IWeaponTier>,
  weaponTiersNPC: {} as Record<WeaponClass, IWeaponTier>,
  rngDungeonConfig: {} as IRNGDungeonConfig,
  spriteinfo: { doorStates: [] },
};

export function setContentKey<T extends keyof typeof __AllContentDontUse>(
  key: T,
  value: (typeof __AllContentDontUse)[T],
) {
  __AllContentDontUse[key] = deepfreeze(value);
}

export function getContentKey<T extends keyof typeof __AllContentDontUse>(
  key: T,
): (typeof __AllContentDontUse)[T] {
  return __AllContentDontUse[key];
}
