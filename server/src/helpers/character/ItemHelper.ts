
import { Injectable } from 'injection-js';
import { isUndefined } from 'lodash';

import { BaseService, ICharacter, IItem, IItemRequirements, IPlayer, ISimpleItem, isOwnedBy, Stat } from '../../interfaces';
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

  public getItemProperties(item: ISimpleItem | undefined, props: Array<keyof IItem>): Partial<Record<keyof IItem, any>> {
    const hash = {};
    props.forEach(prop => hash[prop] = this.getItemProperty(item, prop));
    return hash;
  }

  public setItemProperty(item: ISimpleItem, prop: keyof IItem, value: any): void {
    item.mods[prop] = value;
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

  // check if an item is usable
  public canGetBenefitsFromItem(player: IPlayer, item: ISimpleItem): boolean {
    if (!isOwnedBy(player, item)) return false;
    if (this.isItemBroken(item)) return false;

    const requirements: IItemRequirements = this.game.itemHelper.getItemProperty(item, 'requirements');
    if (requirements) {
      if (requirements.alignment && player.alignment !== requirements.alignment) return false;
      if (requirements.baseClass && player.baseClass !== requirements.baseClass) return false;
      if (requirements.level && player.level < requirements.level) return false;
    }

    // TODO: requirements

    return true;
  }

  // gain or lose condition
  public gainCondition(item: ISimpleItem, conditionLoss: number, character: ICharacter) {
    item.mods.condition = item.mods.condition || 20000;
    item.mods.condition += conditionLoss;
    item.mods.condition = Math.max(0, item.mods.condition);

    if (this.isItemBroken(item)) {
      this.game.characterHelper.calculateStatTotals(character);
    }
  }

  public loseCondition(item: ISimpleItem, conditionLoss: number, character: ICharacter) {
    this.gainCondition(item, -conditionLoss, character);
  }

}
