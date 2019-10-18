import { get } from 'lodash';
import { Inject, Singleton } from 'typescript-ioc';

import { IItem, ISimpleItem, Stat } from '../../interfaces';
import { ContentManager } from '../data/ContentManager';

@Singleton
export class ItemHelper {

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
    const statMod = get(item, `mod.stats.${stat}`, 0);

    const baseItem = this.getItem(item.name);
    const baseStat = get(baseItem, `stats.${stat}`, 0);

    let encrustStat = 0;
    if (item.mods.encrustItem) {
      const encrustItem = this.getItem(item.mods.encrustItem);
      encrustStat = get(encrustItem, `encrustGive.stats.${stat}`, 0);
    }

    return statMod + baseStat + encrustStat;
  }

}
