import { IAccountBank } from './accountbank';
import { SubscriptionTier } from './accountpremium';
import { IAccountAchievements } from './achievements';
import {
  DamageClass,
  Skill,
  SkillBlock,
  TradeskillBlock,
} from './building-blocks';
import { ICharacter } from './character';
import { ICharacterItems } from './characteritems';
import {
  ICharacterLockers,
  ICharacterPouch,
  IMaterialStorage,
} from './characterlockers';
import { ICharacterQuests } from './characterquests';
import { ICharacterTraits } from './charactertraits';
import { IGround } from './ground';
import { INPC } from './npc';
import { ICharacterStatistics, ISessionStatistics } from './statistics';

export type BGM = 'town' | 'dungeon' | 'wilderness';

export interface IPlayer extends ICharacter {
  charSlot: number;

  username: string;
  subscriptionTier: SubscriptionTier;

  bank: IAccountBank;
  items: ICharacterItems;
  traits: ICharacterTraits;
  quests: ICharacterQuests;
  statistics: ICharacterStatistics;
  lockers: ICharacterLockers;
  accountLockers: ICharacterLockers & IMaterialStorage & ICharacterPouch;
  achievements: IAccountAchievements;

  z: number;

  exp: number;
  axp: number;

  gainingAXP: boolean;

  highestLevel: number;
  ancientLevel: number;

  swimLevel: number;
  swimElement: DamageClass | string;

  flaggedSkills: Skill[];
  skillTicks: number;
  paidSkills: SkillBlock;

  lastTileDesc: string;
  lastRegionDesc: string;
  bgmSetting: BGM;

  hungerTicks: number;

  partyName: string;
  respawnPoint: { x: number; y: number; map: string };
  lastDeathLocation?: { map: string; x: number; y: number };

  dailyItems: Record<string, number>;

  runes: string[];
  learnedRunes: string[];

  tradeskills: TradeskillBlock;
  learnedRecipes: string[];

  teleportLocations: Record<string, { x: number; y: number; map: string }>;

  sessionStatistics: ISessionStatistics;

  isGM: boolean;
  isTester: boolean;
}

export interface IPlayerState {
  npcs: Record<string, Partial<INPC>>;
  players: Record<string, Partial<IPlayer>>;
  ground: IGround;
  openDoors: Record<number, boolean>;
}
