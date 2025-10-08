import type {
  ICharacter,
  IItemRequirements,
  IPlayer,
  ISimpleItem,
} from '@lotr/interfaces';
import { Allegiance } from '@lotr/interfaces';
import { itemPropertyGet, itemPropertySet } from './items.properties';

// set the owner of an item
export function itemSetOwner(player: IPlayer, item: ISimpleItem): void {
  itemPropertySet(item, 'owner', player.username);
}

// check if an item is broken
export function itemIsBroken(item: ISimpleItem) {
  const condition = itemPropertyGet(item, 'condition');
  return condition <= 0;
}

export function itemIsOwnedBy(
  character: ICharacter,
  item: ISimpleItem,
): boolean {
  return (
    !item.mods ||
    !item.mods.owner ||
    item.mods.owner === (character as IPlayer).username
  );
}

export function itemIsOwnedAndUnbroken(
  character: ICharacter,
  item: ISimpleItem,
): boolean {
  if (!itemIsOwnedBy(character as IPlayer, item)) return false; // this is safe to coerce, because npcs never tie items
  if (itemIsBroken(item)) return false;

  return true;
}

// check if an item is usable
export function itemCanGetBenefitsFrom(
  char: ICharacter,
  item: ISimpleItem,
): boolean {
  if (!itemIsOwnedAndUnbroken(char, item)) return false;

  // GMs can wear everything disregarding requirements
  if (char.allegiance === Allegiance.GM) return true;

  const requirements: IItemRequirements = itemPropertyGet(item, 'requirements');
  if (requirements) {
    if (requirements.alignment && char.alignment !== requirements.alignment) {
      return false;
    }
    if (requirements.baseClass && char.baseClass !== requirements.baseClass) {
      return false;
    }
    if (requirements.level && char.level < requirements.level) return false;
  }

  return true;
}
