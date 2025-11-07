import { itemGet, itemPropertyGet } from '@lotr/content';
import type { ICharacter, ISimpleItem } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
import { cleanNumber, trinketExpMax } from '@lotr/shared';
import { equipmentItemGet } from './equipment';

export function trinketLevelUp(trinket: ISimpleItem): void {
  const trinketDef = itemGet(trinket.name);
  if (!trinketDef) return;

  const levelup = trinketDef.levelup;
  if (!levelup) return;

  const currentLevel =
    itemPropertyGet(trinket, 'levelupCurrent')?.currentLevel ?? 0;

  trinket.mods ??= {};
  trinket.mods.levelupCurrent ??= {
    currentLevel: 0,
    currentXp: 0,
  };

  trinket.mods.levelupCurrent.currentXp = 0;
  trinket.mods.levelupCurrent.currentLevel = Math.min(
    currentLevel + 1,
    levelup.maxLevel,
  );
}

export function trinketExpGain(char: ICharacter, expGained: number): void {
  const trinket = equipmentItemGet(char, ItemSlot.Trinket);
  if (!trinket) return;

  trinket.mods ??= {};
  trinket.mods.levelupCurrent ??= {
    currentLevel: 0,
    currentXp: 0,
  };

  const currentXp = cleanNumber(trinket.mods.levelupCurrent.currentXp, 0);

  trinket.mods.levelupCurrent.currentXp = Math.min(
    currentXp + expGained,
    trinketExpMax(trinket, itemGet(trinket.name)!),
  );
}
