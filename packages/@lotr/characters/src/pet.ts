import type { ICharacter, INPC } from '@lotr/interfaces';

// check if a character is a pet
export function isPet(character: ICharacter): boolean {
  return !!(character as INPC).owner;
}

// add a pet
export function addPet(owner: ICharacter, pet: INPC): void {
  pet.owner = owner;

  owner.pets = owner.pets || [];
  owner.pets.push(pet);
}

// remove a pet
export function removePet(owner: ICharacter, pet: INPC): void {
  delete pet.owner;

  owner.pets = owner.pets || [];
  owner.pets = owner.pets.filter((x) => x !== pet);
}
