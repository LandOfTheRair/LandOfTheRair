import { Alignment, Allegiance, BaseClass, Direction, ICharacter } from '../interfaces';

export const initializeCharacter = (char: Partial<ICharacter> = {}): ICharacter => ({
  fov: char.fov ?? { },
  uuid: char.uuid ?? '',
  agro: char.agro ?? { },
  learnedSpells: char.learnedSpells ?? { },
  affiliation: char.affiliation ?? '',
  allegianceReputation: char.allegianceReputation ?? {
    [Allegiance.None]: 0,
    [Allegiance.Adventurers]: 0,
    [Allegiance.Pirates]: 0,
    [Allegiance.Royalty]: 0,
    [Allegiance.Townsfolk]: 0,
    [Allegiance.Underground]: 0,
    [Allegiance.Wilderness]: 0,
    [Allegiance.Enemy]: 0,
    [Allegiance.NaturalResource]: 0,
    [Allegiance.GM]: 0
  },
  name: char.name ?? '',
  baseClass: char.baseClass ?? BaseClass.Traveller,
  allegiance: char.allegiance ?? Allegiance.None,
  gender: char.gender ?? 'male',
  x: char.x ?? 14,
  y: char.y ?? 14,
  hp: char.hp ?? { minimum: 0, maximum: 100, current: 100 },
  mp: char.mp ?? { minimum: 0, maximum: 0, current: 0 },
  map: char.map ?? 'Tutorial',
  currency: char.currency ?? { gold: 0 },
  stats: char.stats ?? { },
  totalStats: char.totalStats ?? { },
  skills: char.skills ?? { },
  effects: char.effects ?? { buff: [], debuff: [], outgoing: [], incoming: [], _hash: {} },
  dir: char.dir ?? Direction.South,
  combatTicks: char.combatTicks ?? 0,
  alignment: char.alignment ?? Alignment.Neutral,
  level: char.level ?? 1,
  items: char.items ?? {
    equipment: { },
    sack: { items: [] },
    belt: { items: [] },
    buyback: []
  },
  allTraits: char.allTraits ?? {},
  spellCooldowns: char.spellCooldowns ?? {}
});
