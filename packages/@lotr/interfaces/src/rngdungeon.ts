import {
  Allegiance,
  BaseClass,
  MonsterClass,
  Rollable,
  Stat,
} from './building-blocks';
import { IItemDefinition } from './item';
import { ArmorClass, DamageType, ItemClass, WeaponClass } from './itemtypes';

export enum RNGItemType {
  Armor = 'Armor',
  Weapon = 'Weapon',
  Jewelry = 'Jewelry',

  Caster = 'Caster',
  Offensive = 'Offensive',
  Defensive = 'Defensive',

  Sharp = 'Sharp',
  Blunt = 'Blunt',

  Cloth = 'Cloth',
  Metal = 'Metal',
  Wood = 'Wood',

  OneHanded = 'OneHanded',
  TwoHanded = 'TwoHanded',
  Ranged = 'Ranged',

  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
}

export interface IRNGDungeonConfigFluid {
  spriteStart: number;
}

export interface IRNGDungeonConfigFloor {
  spriteStart: number;
  allowFluids?: boolean;
  fluids?: number[];
  decor: number[];
  flipLR?: boolean;
  allowTrees?: boolean;
  trees?: number[];
  placeOre?: boolean;
  placeTwigs?: boolean;
}

export interface IRNGDungeonConfigWall {
  spriteStart: number;
  allowDoors?: boolean;
  doorStart?: number;
  allowHiddenWalls?: boolean;
  allowEmptyWalls?: boolean;
}

export interface IRNGDungeonMapGenConfig {
  name: string;
  algo: 'Digger' | 'Uniform' | 'Cellular';
  algoArgs: any[];
  iterations?: number;
  randomize?: number;
  doors?: boolean;
  connect?: boolean;
  invert?: boolean;
}

export interface IRNGDungeonRoomDecorConfig {
  name: string;
  decors: Array<{ quantity: number[]; decor: number[] }>;
  allowCustomFloor: boolean;
  customFloors: Array<{
    spriteStart: number;
    decor: number[][];
    trees: number[][];
    placeOre: boolean;
    allowFluids: boolean;
    flipLR: boolean;
    fluids: Array<{ spriteStart: number }>;
  }>;
}

export interface IRNGDungeonNPC {
  name?: string;
  gid: number;
  props: Record<string, string | number>;
}

export interface IRNGDungeonResource {
  id: string;
}

export interface IRNGDungeonCreature {
  sprite: number;
  name: string;
  isLegendary?: boolean;
  monsterClass?: MonsterClass;
  baseClass?: BaseClass;
  statChanges?: Record<Stat, number>;
  guaranteedSkills?: string[];
  guaranteedTraits?: string[];
  weaponType?: WeaponClass;
  offhandType?: WeaponClass;
  armorType?: ArmorClass;
}

export interface IRNGDungeonCreatureGroup {
  name: string;
  creatures: IRNGDungeonCreature[];
  factions: Allegiance[];
}

export interface IRNGDungeonCreatureSkill {
  name: string;
  reqClass: BaseClass;
  minLevel?: number;
  importantSpell?: boolean;
  grants?: string;
}

export interface IRNGDungeonCreatureTrait {
  name: string;
  maxLevel: number;
}

export interface IRNGDungeonCreatureAttribute {
  name: string;
  extra: {
    potency: number;
    damageType?: DamageType;
  };
}

export interface IRNGDungeonScenario {
  name: string;
  creatureSets: Array<{
    group: string;
    options: Array<{ creatures: IRNGDungeonCreatureGroup }>;
  }>;
}

export interface IRNGItem {
  sprites: number[];
  type: RNGItemType[];
}

export interface IRNGItemScenario {
  name: string;
  statChanges: Partial<Record<Stat, number>>;
  topLevelChanges?: Partial<IItemDefinition>;
  requiresTypes?: RNGItemType[];
}

export interface IRNGDungeonMetaConfig {
  name: string;

  mapProps: {
    map: string;
    x: number;
    y: number;
    blockEntryMessage: string;
    maxLevel: number;
    maxSkill: number;
  };

  objProps: {
    entry: {
      teleportTagRef: string;
    };

    exit: {
      teleportTagMap: string;
      teleportTag: string;
    };

    stairs: {
      teleportTagMap: string;
      teleportTag: string;
      teleportTagRef: string;
    };
  };

  npcProps: {
    validNPCs: IRNGDungeonNPC[];
    npcCounts: number[];
  };

  resourceProps: {
    numResources: number;
    validOre: IRNGDungeonResource[];
    validTrees: IRNGDungeonResource[];
  };

  creatureProps: {
    level: number;
    legendaryLevel: number;
    statScale: number;
    baseStat: number;
    legendaryBaseStat: number;
    creaturesPerSet: number;
    baseSkill: number;
    legendaryBaseSkill: number;
    bonusCreatureSkillChoices: number;
    bonusCreatureTraitChoices: number;
    eliteTickCap: number;
    cr: number;
    hpMultiplierNormal: number;
    hpMultiplierLegendary: number;
    goldMultiplierNormal: number;
    goldMultiplierLegendary: number;
    xpMultiplierNormal: number;
    xpMultiplierLegendary: number;
    otherBaseStats: Partial<Record<Stat, number>>;
  };

  itemProps: {
    minTraitScrollLevel: number;
    maxTraitScrollLevel: number;
    maxTraitLevel: number;
    baseTier: number;
    baseArrowTier: number;
    baseSpecificResist: number;
    baseGeneralResist: number;
    baseBoostPercent: number;
    baseArmorClass: number;
    baseShieldArmorClass: number;
    baseWeaponArmorClass: number;
    tanSkillRequired: number;
    numScenarios: number;
    scenarioMultiplier: number;
    mapDropItems: number;
    npcPunchItem: string;
    basicWeight: number;
    powerfulWeight: number;
    legendaryWeight: number;
  };

  droptableProps: {
    alwaysDrop: Rollable[];
  };
}

export interface IRNGDungeonConfigThemeBase {
  floor: IRNGDungeonConfigFloor;
  wall: IRNGDungeonConfigWall;
}

export interface IRNGDungeonConfig {
  fluids: Record<string, IRNGDungeonConfigFluid>;

  foliage: Record<string, number[]>;

  decor: Record<string, number[]>;

  floors: Record<string, IRNGDungeonConfigFloor>;

  walls: Record<string, IRNGDungeonConfigWall>;

  configs: {
    themes: Record<string, IRNGDungeonConfigThemeBase>;

    mapGen: IRNGDungeonMapGenConfig[];

    fluidGen: IRNGDungeonMapGenConfig[];

    roomDecor: IRNGDungeonRoomDecorConfig[];
  };

  dungeonConfigs: IRNGDungeonMetaConfig[];

  npcs: Record<string, IRNGDungeonNPC>;

  resources: Record<string, IRNGDungeonResource>;

  creatures: Record<string, IRNGDungeonCreature>;

  creatureSkills: Record<BaseClass, IRNGDungeonCreatureSkill[]>;

  creatureAttributes: Record<MonsterClass, IRNGDungeonCreatureAttribute[]>;

  creatureTraits: Record<BaseClass, IRNGDungeonCreatureTrait[]>;

  creatureGroupings: Record<string, IRNGDungeonCreatureGroup>;

  scenarioConfigs: IRNGDungeonScenario[];

  itemConfigs: Record<ItemClass, IRNGItem>;

  itemScenarios: IRNGItemScenario[];
}

export enum MapGenTile {
  Empty = 0,
  Wall = 1,
  Door = 2,
  DefaultWall = 3,
}

export interface IGeneratorMapNode {
  x: number;
  y: number;
  idx: number;
  hasFluid: boolean;
  hasFoliage: boolean;
  hasWall: boolean;
  hasDecor: boolean;
  hasDenseDecor: boolean;
  hasOpaqueDecor: boolean;
}

export interface ISpoilerLog {
  isGM?: boolean;
  message: string;
}
