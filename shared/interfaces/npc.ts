import { IBehavior } from './behaviors';
import { Alignment, Allegiance, BaseClass, Hostility, ItemSlot, MonsterClass, RandomNumber, Rollable, SkillBlock } from './building-blocks';
import { ICharacter } from './character';
import { IDialogTree } from './dialog';
import { IStatusEffectInfo } from './status-effect';

export enum NPCTriggerType {
  HP = 'hp',
  Spawn = 'spawn',
  Leash = 'leash',
  Combat = 'combat'
}

export interface INPCDefinition {
  npcId: string;

  // the sprite or sprites this creature can be
  sprite: number | number[];

  // the npc name - optional - if unspecified, generated randomly
  name?: string;

  // the npc "guild" that it belongs to
  affiliation?: string;

  // the alignment of this npc
  alignment?: Alignment;

  // the allegiance of the npc - determines basic reps
  allegiance?: Allegiance;

  // the current reputation (how it views other allegiances)
  allegianceReputation?: { [all in Allegiance]?: number };

  // whether the npc can only use water
  aquaticOnly?: boolean;

  // whether the npc will avoid stepping in water
  avoidWater?: boolean;

  // the base class of the creature
  baseClass?: BaseClass;

  // the base effects given to the creature (usually attributes/truesight/etc)
  baseEffects?: Array<{ name: string, endsAt: number, extra: IStatusEffectInfo }>;

  // the behaviors for the npc
  behaviors: IBehavior[];

  // the drop chance for copying items that are already equipped
  copyDrops?: Rollable[];

  // the dialog tree for the npc, if applicable
  dialog?: IDialogTree;

  // the drop pool for lairs that can drop X of Y items
  dropPool?: {
    min: number,
    max: number,
    items: Rollable[];
  };

  // stuff that can be put in the loot table for normal drops
  drops?: Rollable[];

  // gear items that can spawn on the creature
  items?: {
    equipment?: { [slot in ItemSlot]: Rollable[] };
    sack?: Rollable[];
    belt?: Rollable[];
  };

  // the creatures level
  level: number;

  // the creature class (used for rippers, etc)
  monsterClass?: MonsterClass;

  // the owner of the creature (used for summons)
  owner?: string;

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

  // automatically given to green npcs, their forced x-coordinate
  x?: number;

  // automatically given to green npcs, their forced y-coordinate
  y?: number;
}

export interface INPC extends ICharacter {
  npcId: string;
  sprite: number;
  aquaticOnly?: boolean;
  avoidWater?: boolean;
  hostility?: Hostility;
  owner?: string;
  usableSkills: Rollable[] | string[];

  skillOnKill: number;
  giveXp: { min: number, max: number };

  onlyVisibleTo?: string;

  shouldStrip?: boolean;
  shouldEatTier?: number;
  stripRadius?: number;
  stripOnSpawner?: boolean;
  stripX?: number;
  stripY?: number;

  targetDamageDone?: any;
}
