
import { Injectable } from 'injection-js';
import { isUndefined } from 'lodash';

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

  public getItemProperty(item: ISimpleItem | undefined, prop: keyof IItem): any {
    if (!item) return null;

    if (!isUndefined(item.mods[prop])) return item.mods[prop];

    const realItem = this.getItemDefinition(item.name);
    if (!realItem) return null;

    return realItem[prop];
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

  // check if an item is broken
  public isItemBroken(item: ISimpleItem) {
    const condition = this.getItemProperty(item, 'condition');
    return condition === 0;
  }

  public gainCondition(item: ISimpleItem, conditionLoss: number) {
    item.mods.condition = item.mods.condition || 20000;
    item.mods.condition += conditionLoss;
    item.mods.condition = Math.max(0, item.mods.condition);
  }

  public loseCondition(item: ISimpleItem, conditionLoss: number) {
    this.gainCondition(item, -conditionLoss);
  }

}
