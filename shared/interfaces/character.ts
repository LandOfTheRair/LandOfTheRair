
export type Allegiance = 'None' | 'Adventurers' | 'Pirates' | 'Royalty' | 'Townsfolk' |  'Underground' | 'Wilderness';

export type BaseClass = 'Undecided' | 'Mage' | 'Thief' | 'Healer' | 'Warrior';

export type Stat = 'str' | 'int' | 'dex' | 'int' | 'wis' | 'wil' | 'con' | 'luk' | 'cha'
                 | 'hp' | 'maxhp'
                 | 'mp' | 'maxmp'
                 | 'actionSpeed';

export interface IItem {
  name: string;
}

export interface ISkill {
  name: string;
}

export interface IStat {
  name: Stat;
  value: number;
}

export interface ICharacter {
  name: string;
  slot: number;
  allegiance: Allegiance;
  baseclass: BaseClass;
  gender: 'male'|'female';
  gold: number;
  items: IItem[];
  mapName: string;
  skills: ISkill[];
  stats: IStat[];
  x: number;
  y: number;
}
