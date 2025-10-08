import type { ISimpleItem, Stat, WeaponClass } from '@lotr/interfaces';
import {
  ItemClass,
  ShieldClasses,
  Skill,
  WeaponClasses,
} from '@lotr/interfaces';
import { itemGet } from './items';
import { itemPropertyGet } from './items.properties';

export function getHandsItem() {
  return {
    name: 'hands',
    uuid: 'hands',
    mods: {
      itemClass: ItemClass.Hands,
      type: Skill.Martial,
      tier: 1,
      condition: 20000,
    },
  };
}

// get an items stat
export function itemGetStat(item: ISimpleItem, stat: Stat): number {
  const statMod = item.mods?.stats?.[stat] ?? 0;

  const baseItem = itemGet(item.name);
  const baseStat = baseItem?.stats?.[stat] ?? 0;

  let encrustStat = 0;
  if (item.mods.encrustItem) {
    const encrustItem = itemGet(item.mods.encrustItem);
    if (encrustItem) {
      encrustStat = encrustItem.encrustGive?.stats?.[stat] ?? 0;
    }
  }

  let upgradeStat = 0;
  if (item.mods.upgrades) {
    item.mods.upgrades.forEach((upgrade) => {
      const upgradeItem = itemGet(upgrade);
      if (!upgradeItem) return;

      upgradeStat += upgradeItem.stats?.[stat] ?? 0;
      upgradeStat += upgradeItem.randomStats?.[stat]?.min ?? 0;
    });
  }

  return statMod + baseStat + encrustStat + upgradeStat;
}

export function isShield(item: ISimpleItem) {
  const itemClass = itemPropertyGet(item, 'itemClass');
  return ShieldClasses.includes(itemClass);
}

export function isWeapon(item: ISimpleItem): boolean {
  const itemClass = itemPropertyGet(item, 'itemClass');
  return WeaponClasses.includes(itemClass as WeaponClass);
}
