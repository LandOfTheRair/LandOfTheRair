
import { Injectable } from 'injection-js';

import { BaseService, IItem, ISimpleItem, Stat } from '../../interfaces';
import { ContentManager } from '../data/ContentManager';

// functions related to MODIFYING an item
// not to be confused with ItemCreator which is for HELPER FUNCTIONS that CREATE ITEMS

@Injectable()
export class ItemHelper extends BaseService {

  constructor(
    private content: ContentManager
  ) {
    super();
  }

  public init() {}

  // get the real item for base information lookup
  public getItemDefinition(itemName: string): IItem {
    return this.content.getItemDefinition(itemName);
  }

  // encrust an item with another item
  public encrustItem(baseItem: ISimpleItem, encrustItem: ISimpleItem): void {
    baseItem.mods.encrustItem = encrustItem.name;
  }

  // get an items stat
  public getStat(item: ISimpleItem, stat: Stat): number {
    const statMod = item.mods?.stats?.[stat] ?? 0;

    const baseItem = this.getItemDefinition(item.name);
    const baseStat = baseItem?.stats?.[stat] ?? 0;

    let encrustStat = 0;
    if (item.mods.encrustItem) {
      const encrustItem = this.getItemDefinition(item.mods.encrustItem);
      encrustStat = encrustItem.encrustGive?.stats?.[stat] ?? 0;
    }

    return statMod + baseStat + encrustStat;
  }

}
