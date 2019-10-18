import { Allegiance, BaseClass, Hostility, ItemSlot, MonsterClass, RandomNumber, Rollable, SkillBlock } from './building-blocks';
import { IEffect } from './effect';

export interface ISimpleNPC {
  npcId: string;
  mods: Partial<INPC>;
}

export enum NPCTriggerType {
  HP = 'hp',
  Spawn = 'spawn',
  Leash = 'leash',
  Combat = 'combat'
}

export interface INPC {
  npcId: string;

  // the sprite or sprites this creature can be
  sprite: number[];

  // the npc name - optional - if unspecified, generated randomly
  name?: string;

  // the npc "guild" that it belongs to
  affiliation?: string;

  // the allegiance of the npc - determines basic reps
  allegiance?: Allegiance;

  // the current reputation (how it views other allegiances)
  allegianceReputation?: { [all in Allegiance]?: number };

  // whether the npc can only use water
  aquaticOnly?: boolean;

  // the base class of the creature
  baseClass?: BaseClass;

  // the base effects given to the creature (usually attributes/truesight/etc)
  baseEffects?: IEffect[];

  // the drop chance for copying items that are already equipped
  copyDrops?: Rollable[];

  // the drop pool for lairs that can drop X of Y items
  dropPool?: {
    min: number,
    max: number,
    items: Rollable[];
  };

  // stuff that can be put in the loot table for normal drops
  drops?: Rollable[];

  // gear items that can spawn on the creature
  gear?: { [slot in ItemSlot]: Rollable[] };
  leftHand?: Rollable[];
  rightHand?: Rollable[];
  sack?: Rollable[];
  belt?: Rollable[];

  // the creatures level
  level: number;

  // the creature class (used for rippers, etc)
  monsterClass?: MonsterClass;

  // how hostile the creature is (default: always)
  hostility?: Hostility;

  // the base hp/mp/gold/xp for the creature
  hp: RandomNumber;
  mp: RandomNumber;
  gold: RandomNumber;
  giveXp: RandomNumber;

  // whether the creature should avoid dropping a corpse
  noCorpseDrop?: boolean;

  // whether the creature should avoid dropping items
  noItemDrop?: boolean;

  // the reputation modifications for the killer when this npc is killed
  repMod: Array<{ allegiance: Allegiance, delta: number }>;

  // the amount of skill gained by the party when this creature is killed
  skillOnKill: number;

  // the skills this creature has
  skills: SkillBlock;

  // the skill required to tan this creature
  tanSkillRequired?: number;

  // the item this creature tans for
  tansFor?: string;

  // the trait levels this creature has
  traitLevels?: { [trait: string]: number };

  // npc triggers
  triggers?: { [trigger in NPCTriggerType]: any };

  // npc usable skills
  usableSkills: Rollable[];
}
