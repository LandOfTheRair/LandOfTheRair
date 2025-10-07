import type { ICharacter } from '@lotr/interfaces';

// begin engaging in combat
export function engageInCombat(char: ICharacter, combatTicks = 6) {
  char.combatTicks = combatTicks;
}
