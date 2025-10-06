import type {
  IItem,
  IPlayer,
  ISimpleItem } from '@lotr/interfaces';
import {
  Currency,
  ItemClass,
} from '@lotr/interfaces';

export function listingFeePercent(): number {
  return 0.05;
}

export function calculateListingFee(item: IItem, sellPrice: number): number {
  return Math.max(
    1,
    Math.floor(
      (sellPrice + (item.sellValue || item.value)) * listingFeePercent(),
    ),
  );
}

export function itemListError(
  player: IPlayer,
  item: ISimpleItem,
  realItem: IItem,
  price: number,
): string {
  if (!player) return '';

  if ([ItemClass.Corpse, ItemClass.Coin].includes(realItem.itemClass as any)) {
    return 'That cannot be sold on the market.';
  }

  if (item.mods.owner) return 'That item is bound and cannot be sold.';

  if (item.mods.encrustItem) {
    return 'That item is encrusted and cannot be sold.';
  }

  if (item.mods.destroyOnDrop || realItem.destroyOnDrop) {
    return 'That item is too fragile to be sold.';
  }

  if (item.mods.useEffect) return 'That item is too unique to sell.';

  const gold = player.currency[Currency.Gold] ?? 0;
  if (gold < calculateListingFee(realItem, price)) {
    return 'You do not have enough money to list that item.';
  }

  return '';
}
