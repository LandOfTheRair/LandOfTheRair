import type { ICharacter, ISimpleItem, ItemSlot } from '@lotr/interfaces';

export function equipmentItemGet(
  char: ICharacter,
  slot: ItemSlot,
): ISimpleItem | undefined {
  return char.items.equipment[slot];
}
