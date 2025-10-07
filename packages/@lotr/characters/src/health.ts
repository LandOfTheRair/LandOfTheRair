import type { ICharacter } from '@lotr/interfaces';
import { Allegiance } from '@lotr/interfaces';
import { cleanNumber } from '@lotr/shared';
import { clamp } from 'lodash';

export function heal(char: ICharacter, hp: number): void {
  if (hp === 0) return;

  // natural resources cannot heal
  if (hp > 0 && char.allegiance === Allegiance.NaturalResource) return;

  char.hp.current = clamp(
    char.hp.current + hp,
    char.hp.minimum,
    char.hp.maximum,
  );
  char.hp.current = cleanNumber(char.hp.current, 1, { floor: true });
}

export function healToFull(char: ICharacter): void {
  heal(char, char.hp.maximum);
}

export function takeDamage(char: ICharacter, hp: number): void {
  heal(char, -hp);
}
