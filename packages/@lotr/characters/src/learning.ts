import type { ICharacter } from '@lotr/interfaces';
import { LearnedSpell } from '@lotr/interfaces';

// get the specific learned state for a spell
export function learnedState(
  character: ICharacter,
  spell: string,
): LearnedSpell {
  return character.learnedSpells[spell.toLowerCase()] ?? LearnedSpell.Unlearned;
}

// whether or not this particular character knows how to cast a spell/ability
export function hasLearned(character: ICharacter, spell: string): boolean {
  return learnedState(character, spell) !== LearnedSpell.Unlearned;
}

// whether or not this particular character knows how to cast a spell/ability
export function hasLearnedFromItem(
  character: ICharacter,
  spell: string,
): boolean {
  return character.learnedSpells[spell] === LearnedSpell.FromItem;
}

export function forceSpellLearnStatus(
  character: ICharacter,
  spell: string,
  state: LearnedSpell,
): void {
  character.learnedSpells[spell.toLowerCase()] = state;
}
