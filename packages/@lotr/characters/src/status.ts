import { getEffect, hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

// check if the character can currently act
export function canAct(char: ICharacter): boolean {
  const stunned = getEffect(char, 'Stun');
  const chilled = getEffect(char, 'Chilled');

  const isStunned = stunned?.effectInfo.isFrozen;
  const isChilled = chilled?.effectInfo.isFrozen;

  return !isStunned && !isChilled;
}

// check if the character is dead
export function isDead(char: ICharacter): boolean {
  return char.hp.current <= 0 || hasEffect(char, 'Dead');
}
