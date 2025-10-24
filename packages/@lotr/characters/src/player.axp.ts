import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export function playerCalcAXPReward(char: ICharacter): number {
  if (hasEffect(char, 'Dangerous')) return 10;
  if ((char.name ?? '').includes('elite ')) return 5;
  return 1;
}
