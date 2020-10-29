
export enum Direction {

  // cardinals, used for players
  South = 'S',
  North = 'N',
  East = 'E',
  West = 'W',

  // diagonals
  Southwest = 'SW',
  Southeast = 'SE',
  Northwest = 'NW',
  Northeast = 'NE',

  // special directions
  Corpse = 'C'
}

export enum Allegiance {
  // for things that do not have an allegiance
  None = 'None',

  Adventurers = 'Adventurers',
  Pirates = 'Pirates',
  Royalty = 'Royalty',
  Townsfolk = 'Townsfolk',
  Underground = 'Underground',
  Wilderness = 'Wilderness',

  // for enemies, will always be hostile to everything
  Enemy = 'Enemy',

  // for natural resources
  NaturalResource = 'NaturalResource',

  // for GMs
  GM = 'GM'
}

export enum Alignment {
  Good = 'good',
  Neutral = 'neutral',
  Evil = 'evil'
}

export enum DamageClass {
  Physical = 'physical',
  Necrotic = 'necrotic',
  Energy = 'energy',
  Disease = 'disease',
  Poison = 'poison',
  Water = 'water',
  Fire = 'fire',
  Ice = 'ice',

  // used specifically for guns hunting turkeys
  Turkey = 'turkey',

  // different classes of weapons
  Sharp = 'sharp',
  Blunt = 'blunt'
}

export enum BaseClass {
  Undecided = 'Undecided',
  Mage = 'Mage',
  Thief = 'Thief',
  Healer = 'Healer',
  Warrior = 'Warrior'
}

export enum ItemSlot {
  Head = 'head',
  Neck = 'neck',
  Ear = 'ear',
  Waist = 'waist',
  Wrists = 'wrists',
  Ring = 'ring',      // internal type, not to be used as an actual slot
  Ring1 = 'ring1',
  Ring2 = 'ring2',
  Hands = 'hands',
  Feet = 'feet',
  Armor = 'armor',
  Robe = 'robe',      // internal type, not to be used as an actual slot
  Robe1 = 'robe1',
  Robe2 = 'robe2',
  RightHand = 'rightHand',
  LeftHand = 'leftHand',
  Trinket = 'trinket',
  Potion = 'potion'
}

export enum CoreStat {
  STR = 'str',
  DEX = 'dex',
  AGI = 'agi',
  INT = 'int',
  WIS = 'wis',
  WIL = 'wil',
  CHA = 'cha',
  LUK = 'luk',
  CON = 'con',

  HP = 'hp',
  MP = 'mp',
  HPRegen = 'hpregen',
  MPRegen = 'mpregen',
}

export enum Stat {

  // core
  STR = 'str',
  DEX = 'dex',
  AGI = 'agi',
  INT = 'int',
  WIS = 'wis',
  WIL = 'wil',
  CHA = 'cha',
  LUK = 'luk',
  CON = 'con',

  HP = 'hp',
  MP = 'mp',
  HPRegen = 'hpregen',
  MPRegen = 'mpregen',

  // extra stats
  WeaponDamageRolls = 'weaponDamageRolls',
  WeaponArmorClass = 'weaponArmorClass',
  ArmorClass = 'armorClass',
  Accuracy = 'accuracy',
  Offense = 'offense',
  Defense = 'defense',

  // stealth stats
  Stealth = 'stealth',
  Perception = 'perception',

  // boost stats
  PhysicalBoost = 'physicalDamageBoost',
  MagicalBoost = 'magicalDamageBoost',
  HealingBoost = 'healingBoost',

  // reflect stats
  PhysicalReflect = 'physicalDamageReflect',
  MagicalReflect = 'magicalDamageReflect',

  // resist stats
  Mitigation = 'mitigation',
  MagicalResist = 'magicalResist',
  PhyiscalResist = 'physicalResist',
  NecroticResist = 'necroticResist',
  EnergyResist = 'energyResist',
  WaterResist = 'waterResist',
  FireResist = 'fireResist',
  IceResist = 'iceResist',
  PoisonResist = 'poisonResist',
  DiseaseResist = 'diseaseResist',

  // uncommon
  Move = 'move',
  ActionSpeed = 'actionSpeed',
  DamageFactor = 'damageFactor'
}

export enum Skill {
  Mace = 'mace',
  Axe = 'axe',
  Dagger = 'dagger',
  Sword = 'sword',
  Shortsword = 'shortsword',
  Polearm = 'polearm',
  Wand = 'wand',
  Staff = 'staff',
  Martial = 'martial',
  Ranged = 'ranged',
  Throwing = 'throwing',
  TwoHanded = 'twohanded',
  Thievery = 'thievery',
  Conjuration = 'conjuration',
  Restoration = 'restoration',

  Alchemy = 'alchemy',
  Spellforging = 'spellforging',
  Runewriting = 'runewriting',
  Metalworking = 'metalworking',
  Survival = 'survival'
}

export enum SkillDisplayName {

  // base item classes
  Mace = 'Maces',
  Axe = 'Axes',
  Dagger = 'Daggers',
  Sword = 'Longswords',
  Shortsword = 'Shortswords',
  Polearm = 'Polearms',
  Wand = 'Magical Weapons',
  Staff = 'Staves',

  // special item classes
  Martial = 'Martial Arts',
  Ranged = 'Ranged Weapons',
  Throwing = 'Throwing Weapons',
  TwoHanded = 'Two-handed Weapons',
  Thievery = 'Thievery',
  Conjuration = 'Conjuration Magic',
  Restoration = 'Restoration Magic',

  // tradeskills
  Alchemy = 'Alchemy',
  Spellforging = 'Spellforging',
  Runewriting = 'Runewriting',
  Metalworking = 'Metalworking',
  Survival = 'survival'
}

export enum Hostility {
  Never = 'Never',
  OnHit = 'OnHit',
  Faction = 'Faction',
  Always = 'Always'
}

export enum LearnedSpell {
  FromFate = -2,
  FromItem = -1,
  Unlearned = 0,
  FromTraits = 1
}

export enum Currency {
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October = 'halloween',
  November = 'thanksgiving',
  December = 'winter',

  Gold = 'gold'
}

export enum Holiday {
  Halloween = 'Halloween',
  Thanksgiving = 'Thanksgiving',
  Christmas = 'Christmas'
}

export enum MonsterClass {
  Beast = 'Beast',
  Dragon = 'Dragon',
  Humanoid = 'Humanoid',
  Undead = 'Undead'
}

export type SkillBlock = { [skill in Skill]?: number };

export type StatBlock = { [stat in Stat]?: number };

export type CharacterCurrency = { [currency in Currency]?: number };

export interface Rollable {
  chance: number;
  result: string;
  maxChance?: number;
  requireHoliday?: Holiday;
}

export interface RandomNumber {
  min: number;
  max: number;
}
