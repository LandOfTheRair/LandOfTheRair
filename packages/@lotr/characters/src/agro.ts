import type { ICharacter } from '@lotr/interfaces';

// check if a char has agro with a different char
export function hasAgro(char: ICharacter, target: ICharacter): boolean {
  return target.agro[char.uuid] > 0;
}
