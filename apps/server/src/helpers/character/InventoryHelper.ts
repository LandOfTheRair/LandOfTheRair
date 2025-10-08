import { getStat } from '@lotr/characters';
import {
  coreMaterialStorage,
  itemGet,
  itemPropertiesGet,
  itemPropertyGet,
  settingGameGet,
  traitHasLearned,
  traitLevelValue,
} from '@lotr/content';
import { gainCurrency } from '@lotr/currency';
import type {
  ICharacter,
  IItemContainer,
  IPlayer,
  ISimpleItem,
} from '@lotr/interfaces';
import { Currency, ItemClass, Stat } from '@lotr/interfaces';
import { consoleError } from '@lotr/logger';
import { Injectable } from 'injection-js';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class InventoryHelper extends BaseService {
  private sackSize = 25;
  private beltSize = 5;
  private pouchSize = 5;
  private lockerSize = 25;
  private materialSize = 200;

  init() {
    this.sackSize = settingGameGet('inventory', 'sackSize') ?? 25;
    this.beltSize = settingGameGet('inventory', 'beltSize') ?? 5;
    this.pouchSize = settingGameGet('inventory', 'pouchSize') ?? 5;
    this.lockerSize = settingGameGet('inventory', 'lockerSize') ?? 25;
    this.materialSize = settingGameGet('inventory', 'materialSize') ?? 200;
  }

  // sack functions
  public sackSpaceLeft(player: ICharacter): number {
    return this.sackSize - player.items.sack.items.length;
  }

  public canAddItemToSack(player: ICharacter, item: ISimpleItem): boolean {
    const { isSackable, itemClass } = itemPropertiesGet(item, [
      'isSackable',
      'itemClass',
    ]);
    if (itemClass === ItemClass.Coin) return true;
    if (!isSackable) return false;

    if (player.items.sack.items.length >= this.sackSize) return false;

    return true;
  }

  public addItemToSack(player: ICharacter, item: ISimpleItem): boolean {
    if (!this.canAddItemToSack(player, item)) return false;

    const { itemClass, currency, value } = itemPropertiesGet(item, [
      'itemClass',
      'currency',
      'value',
    ]);
    if (itemClass === ItemClass.Coin) {
      gainCurrency(player, value ?? 0, currency);
      return true;
    }

    this.game.itemHelper.tryToBindItem(player, item);

    player.items.sack.items.push(item);
    player.items.sack.items = player.items.sack.items.filter(Boolean);

    return true;
  }

  public removeItemFromSack(player: ICharacter, slot: number): boolean {
    player.items.sack.items.splice(slot, 1);
    player.items.sack.items = player.items.sack.items.filter(Boolean);

    return true;
  }

  public removeItemsFromSackByUUID(
    player: ICharacter,
    uuids: string[],
  ): boolean {
    player.items.sack.items = player.items.sack.items.filter(
      (x) => !uuids.includes(x.uuid),
    );

    return true;
  }

  public getItemsFromSackByName(
    player: ICharacter,
    filter: string,
  ): ISimpleItem[] {
    return player.items.sack.items.filter((x) => x.name.includes(filter));
  }

  // belt functions
  public beltSpaceLeft(player: ICharacter): number {
    return this.beltSize - player.items.belt.items.length;
  }

  public canAddItemToBelt(player: ICharacter, item: ISimpleItem): boolean {
    const { isBeltable, itemClass } = itemPropertiesGet(item, [
      'isBeltable',
      'itemClass',
    ]);
    if (
      itemClass === ItemClass.Halberd &&
      traitHasLearned(player as IPlayer, 'BigBelt')
    ) {
      return true;
    }
    if (!isBeltable) return false;

    if (player.items.belt.items.length >= this.beltSize) return false;

    return true;
  }

  public addItemToBelt(player: ICharacter, item: ISimpleItem): boolean {
    if (!this.canAddItemToBelt(player, item)) return false;

    player.items.belt.items.push(item);
    player.items.belt.items = player.items.belt.items.filter(Boolean);

    this.game.itemHelper.tryToBindItem(player, item);

    return true;
  }

  public removeItemFromBelt(player: ICharacter, slot: number): boolean {
    player.items.belt.items.splice(slot, 1);
    player.items.belt.items = player.items.belt.items.filter(Boolean);

    return true;
  }

  public removeItemsFromBeltByUUID(
    player: ICharacter,
    uuids: string[],
  ): boolean {
    player.items.belt.items = player.items.belt.items.filter(
      (x) => !uuids.includes(x.uuid),
    );

    return true;
  }

  // pouch functions
  public pouchSpaceLeft(player: IPlayer): number {
    return this.pouchSize - player.accountLockers.pouch.items.length;
  }

  public canAddItemToPouch(player: IPlayer, item: ISimpleItem): boolean {
    const itemClass = itemPropertyGet(item, 'itemClass');
    if (itemClass === ItemClass.Corpse || itemClass === ItemClass.Coin) {
      return false;
    }

    if (player.accountLockers.pouch.items.length >= this.pouchSize) {
      return false;
    }

    return true;
  }

  public addItemToPouch(player: IPlayer, item: ISimpleItem): boolean {
    if (!this.canAddItemToPouch(player, item)) return false;

    player.accountLockers.pouch.items.push(item);
    player.accountLockers.pouch.items =
      player.accountLockers.pouch.items.filter(Boolean);

    this.game.itemHelper.tryToBindItem(player, item);

    return true;
  }

  public removeItemFromPouch(player: IPlayer, slot: number): boolean {
    player.accountLockers.pouch.items.splice(slot, 1);
    player.accountLockers.pouch.items =
      player.accountLockers.pouch.items.filter(Boolean);

    return true;
  }

  public removeItemsFromPouchByUUID(player: IPlayer, uuids: string[]): boolean {
    player.accountLockers.pouch.items =
      player.accountLockers.pouch.items.filter((x) => !uuids.includes(x.uuid));

    return true;
  }

  // locker functions
  public lockerSpaceLeft(player: ICharacter, locker: IItemContainer): number {
    return this.lockerSize - locker.items.length;
  }

  public canAddItemToLocker(
    player: IPlayer,
    item: ISimpleItem,
    locker: IItemContainer,
  ): boolean {
    const itemClass = itemPropertyGet(item, 'itemClass');
    const succorInfo = itemPropertyGet(item, 'succorInfo');

    if (
      itemClass === ItemClass.Coin ||
      itemClass === ItemClass.Corpse ||
      item.name.includes('Conjured') ||
      succorInfo
    ) {
      return false;
    }

    if (locker.items.length >= this.lockerSize) return false;

    return true;
  }

  public addItemToLocker(
    player: IPlayer,
    item: ISimpleItem,
    locker: IItemContainer,
  ): boolean {
    locker.items.push(item);
    locker.items = locker.items.filter(Boolean);

    this.game.itemHelper.tryToBindItem(player, item);

    return true;
  }

  public removeItemFromLocker(
    player: IPlayer,
    slot: number,
    locker: IItemContainer,
  ): boolean {
    locker.items.splice(slot, 1);
    locker.items = locker.items.filter(Boolean);

    return true;
  }

  public removeItemsFromLockerByUUID(
    player: IPlayer,
    uuids: string[],
    locker: IItemContainer,
  ): boolean {
    locker.items = locker.items.filter((x) => !uuids.includes(x.uuid));
    locker.items = locker.items.filter(Boolean);

    return true;
  }

  // material functions
  public materialSpaceLeft(player: IPlayer, material: string): number {
    return (
      this.game.subscriptionHelper.maxMaterialStorageSpace(
        player,
        this.materialSize,
      ) - (player.accountLockers.materials[material] ?? 0)
    );
  }

  public canAddMaterial(player: IPlayer, material: string): boolean {
    const materialData = coreMaterialStorage();
    return !!materialData.slots[material];
  }

  public addMaterial(player: IPlayer, material: string, number = 1): void {
    if (isNaN(number)) {
      consoleError(
        'MaterialStorage',
        new Error(
          `Adding NaN to materials: ${player.name} (${player.username})/${material}!`,
        ),
      );
      return;
    }

    player.accountLockers.materials[material] ??= 0;
    player.accountLockers.materials[material] += number;

    if (player.accountLockers.materials[material] <= 0) {
      player.accountLockers.materials[material] = 0;
    }
  }

  public removeMaterial(player: IPlayer, material: string, number = 1): void {
    this.addMaterial(player, material, -number);
  }

  public itemValue(check: ICharacter | undefined, item: ISimpleItem): number {
    const { ounces: baseOunces, sellValue: baseSellValue } = itemGet(
      item.name,
    )!;
    const { itemClass, value, sellValue, ounces } = itemPropertiesGet(item, [
      'itemClass',
      'value',
      'sellValue',
      'ounces',
    ]);
    const baseItemValue = sellValue || value || 1;

    if (itemClass === ItemClass.Bottle && ounces === 0) return 100;

    const { sellValuePercent, sellChaBaseBoost, sellChaBaseDivisor } =
      settingGameGet('character');

    // default sell percent is 25% of value if it doesn't have a set sellValue
    let sellPercent = baseSellValue ? 100 : (sellValuePercent ?? 25);

    // items that do not have a modded sellvalue (ie, rare gems) can get modified
    if (check && !item.mods.sellValue) {
      // sliding scale % based on CHA
      const cha = getStat(check, Stat.CHA);

      // at a base of 10, you get +0.2% value per CHA
      const sellPercentMod =
        (cha - (sellChaBaseBoost ?? 10)) / (sellChaBaseDivisor ?? 5);
      sellPercent += sellPercentMod;
    }

    // get the total value, assign it to buyback (in case they wanna buy it back)
    let totalSellValue = Math.max(
      1,
      Math.floor(baseItemValue * (sellPercent / 100)),
    );

    if (check) {
      const ancientMult = 1 + traitLevelValue(check, 'AncientBartering');
      totalSellValue *= ancientMult;
    }

    const baseOz = baseOunces ?? 0;
    const checkOz = ounces ?? 0;
    if (baseOz > 0 && checkOz > 0) {
      totalSellValue = Math.round((totalSellValue * checkOz) / baseOz);
    }

    return totalSellValue;
  }

  // whether or not the player can sell an item
  public canSellItem(player: IPlayer, item: ISimpleItem): boolean {
    const value = this.itemValue(player, item);
    return value > 10;
  }

  // sell items / deal with buyback
  public sellItem(player: IPlayer, item: ISimpleItem): void {
    // some items have a raw value they sell for
    const { itemClass } = itemPropertiesGet(item, ['itemClass']);

    // get the total value, assign it to buyback (in case they wanna buy it back)
    const totalSellValue = this.itemValue(player, item);

    item.mods.buybackValue = totalSellValue;
    this.addItemToBuyback(player, item);

    // tell them they sold the item and give em the money
    gainCurrency(player, totalSellValue, Currency.Gold);
    this.game.messageHelper.sendSimpleMessage(
      player,
      `You sold the ${(itemClass || 'item').toLowerCase()} for ${totalSellValue.toLocaleString()} gold.`,
    );
  }

  // buyback functions
  public addItemToBuyback(player: IPlayer, item: ISimpleItem): boolean {
    player.items.buyback.push(item);
    player.items.buyback = player.items.buyback.filter(Boolean);

    if (player.items.buyback.length > 5) player.items.buyback.shift();

    return true;
  }

  public removeItemFromBuyback(player: IPlayer, slot: number): boolean {
    player.items.buyback.splice(slot, 1);
    player.items.buyback = player.items.buyback.filter(Boolean);

    return true;
  }
}
