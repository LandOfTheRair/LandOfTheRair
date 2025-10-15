import { itemPropertyGet } from '@lotr/content';
import type { ICharacter, ItemSlot } from '@lotr/interfaces';

// check if there exists an equipment effect on a character
export function effectCountEquipment(
  character: ICharacter,
  effect: string,
): number {
  return Object.keys(character.items.equipment).filter((itemSlot) => {
    const item = character.items.equipment[itemSlot as ItemSlot];
    if (!item) return false;

    const equipEffect = itemPropertyGet(item, 'equipEffect');
    if (!equipEffect) return;

    return equipEffect.name === effect;
  }).length;
}
