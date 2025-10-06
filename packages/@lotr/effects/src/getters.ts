import type { ICharacter, IStatusEffect } from '@lotr/interfaces';

// check if someone has an effect
export function hasEffect(char: ICharacter, effName: string): boolean {
  return !!char.effects?._hash?.[effName];
}

// check if someone has an effect based on a string-ish
export function hasEffectLike(char: ICharacter, effIsh: string): boolean {
  const keys = Object.keys(char.effects?._hash ?? {});
  return keys.some((k) => k.includes(effIsh));
}

// get an effect from someone
export function getEffect(char: ICharacter, effName: string): IStatusEffect {
  return char.effects?._hash?.[effName];
}

// get effects from someone based on an ish
export function getEffectLike(
  char: ICharacter,
  effIsh: string,
): IStatusEffect[] {
  const keys = Object.keys(char.effects?._hash ?? {});
  return keys
    .filter((k) => k.includes(effIsh))
    .map((k) => char.effects._hash[k]);
}

// get the potency of an effect
export function getEffectPotency(char: ICharacter, effName: string): number {
  return char.effects?._hash?.[effName]?.effectInfo.potency ?? 0;
}
