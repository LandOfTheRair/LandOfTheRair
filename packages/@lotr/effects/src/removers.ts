import {
  BuffType,
  type ICharacter,
  type IStatusEffect,
  type Stat,
} from '@lotr/interfaces';

// get total effect stat bonuses
export function effectStatBonuses(
  character: ICharacter,
): Partial<Record<Stat, number>> {
  const stats: Partial<Record<Stat, number>> = {};

  Object.values(character.effects._hash).forEach((effect) => {
    const statBoosts = effect.effectInfo.statChanges;
    Object.keys(statBoosts || {}).forEach((stat) => {
      const statKey = stat as Stat;
      stats[statKey] = stats[statKey] || 0;
      stats[statKey] += statBoosts?.[statKey] ?? 0;
    });
  });

  return stats;
}

// dispellable effects are only in buff (not incoming or outgoing), and they must be self-removable
export function dispellableEffects(char: ICharacter): IStatusEffect[] {
  return char.effects[BuffType.Buff].filter((x) => {
    if (x.endsAt === -1) return false;
    if (!x.effectInfo.canRemove) return false;

    return true;
  });
}
