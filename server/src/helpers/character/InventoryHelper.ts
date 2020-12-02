import { Injectable } from 'injection-js';
import { BaseService, Currency, ICharacter, IPlayer, ISimpleItem, ItemClass, Stat } from '../../interfaces';

@Injectable()
export class InventoryHelper extends BaseService {

  init() {}

  // sack functions
  public sackSpaceLeft(player: ICharacter): number {
    return 25 - player.items.sack.items.length;
  }

  public canAddItemToSack(player: ICharacter, item: ISimpleItem): boolean {
    const isSackable = this.game.itemHelper.getItemProperty(item, 'isSackable');
    if (!isSackable) return false;

    if (player.items.sack.items.length >= 25) return false;

    return true;
  }

  public addItemToSack(player: ICharacter, item: ISimpleItem): boolean {
    if (!this.canAddItemToSack(player, item)) return false;

    const { itemClass, currency, value } = this.game.itemHelper.getItemProperties(item, ['itemClass', 'currency', 'value']);
    if (itemClass === ItemClass.Coin) {
      this.game.characterHelper.gainCurrency(player, value ?? 0, currency);
      return true;
    }

    player.items.sack.items.push(item);
    player.items.sack.items = player.items.sack.items.filter(Boolean);

    return true;
  }

  public removeItemFromSack(player: ICharacter, slot: number): boolean {
    player.items.sack.items.splice(slot, 1);
    player.items.sack.items = player.items.sack.items.filter(Boolean);

    return true;
  }

  // belt functions
  public beltSpaceLeft(player: ICharacter): number {
    return 5 - player.items.belt.items.length;
  }

  public canAddItemToBelt(player: ICharacter, item: ISimpleItem): boolean {
    const isBeltable = this.game.itemHelper.getItemProperty(item, 'isBeltable');
    if (!isBeltable) return false;

    if (player.items.belt.items.length >= 5) return false;

    return true;
  }

  public addItemToBelt(player: ICharacter, item: ISimpleItem): boolean {
    if (!this.canAddItemToBelt(player, item)) return false;

    player.items.belt.items.push(item);
    player.items.belt.items = player.items.belt.items.filter(Boolean);

    return true;
  }

  public removeItemFromBelt(player: ICharacter, slot: number): boolean {
    player.items.belt.items.splice(slot, 1);
    player.items.belt.items = player.items.belt.items.filter(Boolean);

    return true;
  }

  // sell items / deal with buyback
  public sellItem(player: IPlayer, item: ISimpleItem): void {

    // some items have a raw value they sell for
    const { value, sellValue, itemClass } = this.game.itemHelper.getItemProperties(item, ['value', 'sellValue', 'itemClass']);
    const baseItemValue = sellValue || value || 1;

    // default sell percent is 25% of value if it doesn't have a set sellValue
    let sellPercent = sellValue ? 100 : 25;

    // sliding scale % based on CHA
    const cha = this.game.characterHelper.getStat(player, Stat.CHA);

    // at a base of 10, you get +0.2% value per CHA
    const sellPercentMod = (cha - 10) / 5;
    sellPercent += sellPercentMod;

    // get the total value, assign it to buyback (in case they wanna buy it back)
    const totalSellValue = Math.max(1, Math.floor(baseItemValue * (sellPercent / 100)));

    item.mods.buybackValue = totalSellValue;
    this.addItemToBuyback(player, item);

    // tell them they sold the item and give em the money
    this.game.characterHelper.gainCurrency(player, totalSellValue, Currency.Gold);
    this.game.messageHelper.sendSimpleMessage(player, `You sold the ${(itemClass || 'item').toLowerCase()} for ${totalSellValue.toLocaleString()} gold.`);
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
