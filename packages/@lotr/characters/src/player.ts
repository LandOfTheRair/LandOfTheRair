import type { ICharacter, IPlayer } from '@lotr/interfaces';

// check if a character is a player
export function isPlayer(character: ICharacter): boolean {
  return !!(character as IPlayer).username;
}
