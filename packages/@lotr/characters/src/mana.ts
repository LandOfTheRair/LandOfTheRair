import type { ICharacter } from '@lotr/interfaces';
import { cleanNumber } from '@lotr/shared';
import { clamp } from 'lodash';

export function mana(char: ICharacter, mp: number): void {
  char.mp.current = clamp(
    char.mp.current + mp,
    char.mp.minimum,
    char.mp.maximum,
  );
  char.mp.current = cleanNumber(char.mp.current, 1, { floor: true });
}

export function manaDamage(char: ICharacter, mp: number): void {
  mana(char, -mp);
}

export function manaToFull(char: ICharacter): void {
  mana(char, char.mp.maximum);
}
