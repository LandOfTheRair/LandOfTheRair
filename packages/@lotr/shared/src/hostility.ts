import type { Allegiance, ICharacter } from '@lotr/interfaces';

export function isHostileTo(char: ICharacter, faction: Allegiance) {
  if (!char.allegianceReputation?.[faction]) return false;
  const rep = char.allegianceReputation[faction] ?? 0;
  return rep <= -100;
}

export function isFriendlyTo(char: ICharacter, faction: Allegiance) {
  if (!char.allegianceReputation?.[faction]) return false;
  const rep = char.allegianceReputation[faction] ?? 0;
  return rep >= 100;
}

export function isNeutralTo(char: ICharacter, faction: Allegiance) {
  if (!char.allegianceReputation?.[faction]) return true;
  return !isHostileTo(char, faction) && !isFriendlyTo(char, faction);
}
