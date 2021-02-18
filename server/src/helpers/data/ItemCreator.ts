
import { Injectable } from 'injection-js';
import { cloneDeep, random, sample, sum } from 'lodash';
import uuid from 'uuid/v4';

import { Currency, IItemDefinition, ISimpleItem, ItemClass, ItemQuality } from '../../interfaces';
import { BaseService } from '../../models/BaseService';
import { ContentManager } from './ContentManager';

// functions related to CREATING an item
// not to be confused with ItemHelper which is for HELPER FUNCTIONS that MODIFY ITEMS
@Injectable()
export class ItemCreator extends BaseService {

  constructor(
    private content: ContentManager
  ) {
    super();
  }

  public init() {}

  // get an item that can be equipped
  public getSimpleItem(itemName: string): ISimpleItem {
    const itemDefinition = this.content.getItemDefinition(itemName);
    if (!itemDefinition) throw new Error(`Item ${itemName} does not exist and cannot be created.`);

    const item: ISimpleItem = { name: itemName, uuid: uuid(), mods: {} };

    if (itemDefinition.itemClass === ItemClass.Coin) {
      item.mods.value = 1;
      item.mods.currency = Currency.Gold;
    }

    ['ounces', 'shots', 'trapUses'].forEach(modKey => {
      if (!itemDefinition[modKey]) return;

      item.mods[modKey] = itemDefinition[modKey];
    });

    this.rollStats(item, itemDefinition);

    return item;

  }

  // get a gold item of the specified value
  public getGold(value: number): ISimpleItem {
    const baseGold = this.getSimpleItem('Gold Coin');
    baseGold.mods.value = value;
    return baseGold;
  }

  public rerollItem(item: ISimpleItem): ISimpleItem {
    const newItem = cloneDeep(item);
    this.resetUUID(newItem);

    const itemDefinition = this.content.getItemDefinition(item.name);
    if (itemDefinition) {
      this.rollStats(item, itemDefinition);
    }

    return newItem;
  }

  public resetUUID(item: ISimpleItem): void {
    item.uuid = uuid();
  }

  // do randomStats, randomTrait, assign quality
  private rollStats(item: ISimpleItem, itemDef: IItemDefinition): ISimpleItem {

    const qualityValues: number[] = [];

    if (itemDef.randomTrait) {
      item.mods.trait = { name: '', level: 0 };

      item.mods.trait.name = sample(itemDef.randomTrait.name);

      const { min, max } = itemDef.randomTrait.level;
      const rolled = random(min, max);

      item.mods.trait.level = rolled;

      let percentileRank = +(((rolled) / (max)) / 0.25).toFixed(0);
      if (percentileRank <= 0) percentileRank = 1;

      qualityValues.push(rolled === max ? ItemQuality.PERFECT : percentileRank);
    }

    if (itemDef.randomStats) {
      item.mods.stats = item.mods.stats || {};

      const allRandomStats = Object.keys(itemDef.randomStats);

      allRandomStats.forEach(randomStat => {
        const { min, max } = itemDef.randomStats[randomStat];
        const rolled = random(min, max);

        if (isNaN(rolled)) return;

        item.mods.stats![randomStat] = item.mods.stats![randomStat] || 0;
        item.mods.stats![randomStat] += rolled;

        let percentileRank = +(((rolled) / (max)) / 0.25).toFixed(0);
        if (percentileRank <= 0) percentileRank = 1;

        qualityValues.push(rolled === max ? ItemQuality.PERFECT : percentileRank);
      });
    }

    if (qualityValues.length > 0) {
      const overallQuality = Math.max(1, Math.floor(sum(qualityValues) / qualityValues.length));
      item.mods.quality = Math.max(1, overallQuality);
    }

    return item;
  }

}
