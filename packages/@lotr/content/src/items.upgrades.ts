import type { ISimpleItem } from '@lotr/interfaces';
import {
  itemPropertiesGet,
  itemPropertyGet,
  itemPropertySet,
} from './items.properties';

// encrust an item with another item
export function itemSetEncrust(
  baseItem: ISimpleItem,
  itemToEncrust: ISimpleItem,
): void {
  itemPropertySet(baseItem, 'encrustItem', itemToEncrust.name);
}

// check if an item can be used as an upgrade material
export function itemCanBeUsedForUpgrade(upgradeItem: ISimpleItem): boolean {
  return itemPropertyGet(upgradeItem, 'canUpgradeWith');
}

// check if an item can be upgraded
export function itemCanBeUpgraded(
  baseItem: ISimpleItem,
  bypassLimit = false,
): boolean {
  if (bypassLimit) return true;
  const { maxUpgrades } = itemPropertiesGet(baseItem, ['maxUpgrades']);
  return (baseItem.mods.upgrades?.length ?? 0) < (maxUpgrades ?? 0);
}

export function itemMarkIdentified(item: ISimpleItem, tier: number): void {
  itemPropertySet(
    item,
    'identifyTier',
    Math.max(item.mods.identifyTier ?? 0, tier),
  );
}
