import { ItemSlot, type ICharacter, type IPlayer } from '@lotr/interfaces';

// check if this player is holding something
export function hasHeldItem(
  char: ICharacter,
  item: string,
  hand: 'left' | 'right' = 'right',
): boolean {
  const ref = char.items.equipment[`${hand}Hand`];
  return !!(
    ref &&
    ref.name === item &&
    (!ref.mods.owner || ref.mods.owner === (char as IPlayer).username)
  );
}

export function hasHeldItemInEitherHand(
  char: ICharacter,
  item: string,
): boolean {
  return hasHeldItem(char, item, 'right') || hasHeldItem(char, item, 'left');
}

export function hasHeldItems(
  char: ICharacter,
  item1: string,
  item2: string,
): boolean {
  return (
    (hasHeldItem(char, item1, 'right') && hasHeldItem(char, item2, 'left')) ||
    (hasHeldItem(char, item2, 'right') && hasHeldItem(char, item1, 'left'))
  );
}

// check if the person has an empty hand
export function hasEmptyHand(char: ICharacter): boolean {
  return !(
    char.items.equipment[ItemSlot.RightHand] &&
    char.items.equipment[ItemSlot.LeftHand]
  );
}

// get an empty hand for the character
export function getEmptyHand(char: ICharacter): ItemSlot | null {
  if (!char.items.equipment[ItemSlot.RightHand]) return ItemSlot.RightHand;
  if (!char.items.equipment[ItemSlot.LeftHand]) return ItemSlot.LeftHand;
  return null;
}
