import { IAccountBank } from './accountbank';
import { DamageClass, Skill, SkillBlock } from './building-blocks';
import { ICharacter } from './character';
import { ICharacterItems } from './characteritems';
import { ICharacterLockers, IMaterialStorage } from './characterlockers';
import { ICharacterQuests } from './characterquests';
import { ICharacterTraits } from './charactertraits';
import { ISimpleItem } from './item';
import { ICharacterStatistics } from './statistics';

export type BGM = 'town' | 'dungeon' | 'wilderness';

export interface IPlayer extends ICharacter {
  charSlot: number;

  username: string;
  isSubscribed: boolean;

  bank: IAccountBank;
  items: ICharacterItems;
  traits: ICharacterTraits;
  quests: ICharacterQuests;
  statistics: ICharacterStatistics;
  lockers: ICharacterLockers;
  accountLockers: ICharacterLockers & IMaterialStorage;

  z: number;

  exp: number;
  axp: number;

  gainingAXP: boolean;

  highestLevel: number;
  ancientLevel: number;

  swimLevel: number;
  swimElement: DamageClass | string;

  flaggedSkills: Skill[];
  paidSkills: SkillBlock;

  corpseRef?: ISimpleItem;

  lastTileDesc: string;
  lastRegionDesc: string;
  bgmSetting: BGM;

  hungerTicks: number;

  partyName: string;
  respawnPoint: { x: number, y: number, map: string };
  lastDeathLocation?: { map: string, x: number, y: number };

  dailyItems: Record<string, number>;

  runes: string[];
  learnedRunes: string[]
}
