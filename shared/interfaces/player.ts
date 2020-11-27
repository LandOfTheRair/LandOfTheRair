import { DamageClass, LearnedSpell, Skill } from './building-blocks';
import { ICharacter } from './character';
import { ICharacterTraits } from './charactertraits';
import { ISimpleItem } from './item';

export type BGM = 'town' | 'dungeon' | 'wilderness';

export interface IPlayer extends ICharacter {
  charSlot: number;

  username: string;
  isSubscribed: boolean;

  traits: ICharacterTraits;
  
  z: number;

  exp: number;
  axp: number;

  gainingAXP: boolean;

  highestLevel: number;
  ancientLevel: number;

  swimLevel: number;
  swimElement: DamageClass | string;

  flaggedSkills: Skill[];

  corpseRef?: ISimpleItem;

  learnedSpells: { [spellName: string]: LearnedSpell };

  lastTileDesc: string;
  lastRegionDesc: string;
  bgmSetting: BGM;

  hungerTicks: number;

  partyName: string;
  respawnPoint: { x: number, y: number, map: string };
  lastDeathLocation?: { map: string, x: number, y: number };

  dailyItems: Record<string, number>;
}
