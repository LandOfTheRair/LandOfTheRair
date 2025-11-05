import type { ICharacter } from '@lotr/interfaces';
import { traitGet } from './traits';

// the level of the trait for the character
export function traitLevel(character: ICharacter, trait: string): number {
  return character.allTraits[trait] ?? 0;
}

// whether or not the player has learned the trait
export function traitHasLearned(player: ICharacter, trait: string): boolean {
  return traitLevel(player, trait) > 0;
}

// the level of the trait for the character
export function traitLevelValue(character: ICharacter, trait: string): number {
  const traitData = traitGet(trait, `TLV:${character.name}`);
  if (!traitData || !traitData.valuePerTier) return 0;

  return traitData.valuePerTier * (character.allTraits[trait] || 0);
}
