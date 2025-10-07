import type { ICharacter } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { isPlayer } from './player';

// get a specific stat value from a character
export function getStat(character: ICharacter, stat: Stat): number {
  const value = character.totalStats[stat] ?? 0;
  if (value < 0 && stat === Stat.Mitigation) return 0;
  if (value === 0 && stat === Stat.DamageFactor) return 1;
  if (value !== 0 && stat === Stat.DamageFactor && isPlayer(character)) {
    return 1 + value;
  }
  return value;
}

// get a specific base stat value from a character
export function getBaseStat(character: ICharacter, stat: Stat): number {
  return character.stats[stat] ?? 0;
}
