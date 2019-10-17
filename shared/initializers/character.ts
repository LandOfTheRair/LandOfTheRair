import { Alignment, Allegiance, BaseClass, Direction, ICharacter } from '../interfaces';

export const initializeCharacter = (char: Partial<ICharacter> = {}): ICharacter => {
  return {
    uuid: char.uuid ?? '',
    agro: char.agro ?? { },
    affiliation: char.affiliation ?? '',
    allegianceReputation: char.allegianceReputation ?? { },
    name: char.name ?? '',
    baseClass: char.baseClass ?? BaseClass.Undecided,
    allegiance: char.allegiance ?? Allegiance.None,
    gender: char.gender ?? 'male',
    x: char.x ?? 14,
    y: char.y ?? 14,
    map: char.map ?? 'Tutorial',
    currency: char.currency ?? { gold: 0 },
    stats: char.stats ?? { },
    skills: char.skills ?? { },
    effects: char.effects ?? { },
    dir: char.dir ?? Direction.South,
    combatTicks: char.combatTicks ?? 0,
    alignment: char.alignment ?? Alignment.Neutral,
    level: char.level ?? 1,
    items: char.items ?? {
      potion: undefined,
      equipment: { },
      sack: { items: [] },
      belt: { items: [] },
      pouch: { items: [] },
      buyback: []
    }
  };
};
