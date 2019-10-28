import { Inject, Singleton } from 'typescript-ioc';

import { BaseService, IItem, ISimpleItem, Stat } from '../../interfaces';
import { ContentManager } from '../data/ContentManager';

@Singleton
export class ItemHelper extends BaseService {

  @Inject private content: ContentManager;

  public init() {}

  // get an item that can be equipped
  public getSimpleItem(itemName: string): ISimpleItem {
    return { name: itemName, mods: {} };
  }

  // get the real item for base information lookup
  public getItem(itemName: string): IItem {
    return this.content.items[itemName];
  }

  // encrust an item with another item
  public encrustItem(baseItem: ISimpleItem, encrustItem: ISimpleItem): void {
    baseItem.mods.encrustItem = encrustItem.name;
  }

  // get an items stat
  public getStat(item: ISimpleItem, stat: Stat): number {
    const statMod = item.mods?.stats?.[stat] ?? 0;

    const baseItem = this.getItem(item.name);
    const baseStat = baseItem?.stats?.[stat] ?? 0;

    let encrustStat = 0;
    if (item.mods.encrustItem) {
      const encrustItem = this.getItem(item.mods.encrustItem);
      encrustStat = encrustItem.encrustGive?.stats?.[stat] ?? 0;
    }

    return statMod + baseStat + encrustStat;
  }

}
