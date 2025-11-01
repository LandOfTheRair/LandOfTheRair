import {
  itemCanGetBenefitsFrom,
  itemGet,
  itemPropertiesGet,
} from '@lotr/content';
import type { ICharacter, INPC, IPlayer, ItemClass } from '@lotr/interfaces';
import { GivesBonusInHandItemClasses, ItemSlot } from '@lotr/interfaces';
import { equipmentItemGet } from './equipment';
import { isPlayer } from './player';

export function traitLevelAdd(
  character: ICharacter,
  trait: string,
  addedTraitLevel: number,
): void {
  if (!trait) return;

  character.allTraits[trait] ??= 0;
  character.allTraits[trait] += addedTraitLevel;
}

export function traitGetAllLearned(player: IPlayer): Record<string, number> {
  return player.traits.traitsLearned;
}

// recalculate all traits that exist for this character
export function recalculateTraits(character: ICharacter): void {
  character.allTraits = {};

  let learnedTraits: Record<string, number> = {};

  // base traits from self/learned
  if (isPlayer(character)) {
    learnedTraits = traitGetAllLearned(character as IPlayer);
  } else {
    learnedTraits = (character as INPC).traitLevels ?? {};
  }

  Object.keys(learnedTraits).forEach((traitKey) => {
    traitLevelAdd(character, traitKey, learnedTraits[traitKey] ?? 0);
  });

  // traits from equipment
  Object.keys(character.items.equipment).forEach((itemSlot) => {
    const item = equipmentItemGet(character, itemSlot as ItemSlot);
    if (!item) return;

    // no bonus if we can't technically use the item
    if (
      isPlayer(character) &&
      !itemCanGetBenefitsFrom(character as IPlayer, item)
    ) {
      return;
    }

    // only some items give bonuses in hands
    const { itemClass, trait } = itemPropertiesGet(item, [
      'itemClass',
      'trait',
    ]);
    if (
      [ItemSlot.RightHand, ItemSlot.LeftHand].includes(itemSlot as ItemSlot) &&
      !GivesBonusInHandItemClasses.includes(itemClass as ItemClass)
    ) {
      return;
    }

    if (trait) {
      traitLevelAdd(character, trait.name, trait.level);
    }

    if (item.mods.upgrades) {
      item.mods.upgrades.forEach((upgrade) => {
        const upgradeItem = itemGet(upgrade);
        if (!upgradeItem) return;

        const upgradeItemTrait = upgradeItem.trait;

        if (upgradeItemTrait) {
          traitLevelAdd(
            character,
            upgradeItemTrait.name,
            upgradeItemTrait.level,
          );
        }
      });
    }
  });

  // get benefits from inscribed rune scrolls
  if (isPlayer(character)) {
    (character as IPlayer).runes.forEach((rune) => {
      if (!rune) return;

      try {
        const item = itemGet(rune);
        if (!item?.trait) return;

        traitLevelAdd(character, item.trait.name, item.trait.level);
      } catch {}
    });
  }
}
