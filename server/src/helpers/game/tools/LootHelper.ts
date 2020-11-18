
import { Injectable } from 'injection-js';
import { get, random } from 'lodash';
import { LootTable } from 'lootastic';

import { Allegiance, BaseService, INPC, ISimpleItem, ItemSlot } from '../../../interfaces';

@Injectable()
export class LootHelper extends BaseService {

  constructor(
    // private holidayHelper: HolidayHelper
    // private content: ContentManager
  ) {
    super();
  }

  public init() {}

  // choose items to drop with replacing, aka, pick from the same pool each time (no removals)
  public chooseWithReplacement(choices: any[], number = 1) {
    if (choices.length === 0) return [];
    const table = new LootTable(choices);
    return table.chooseWithReplacement(number);
  }

  // choose items to drop without replacing, aka, keep taking from the pool
  private chooseWithoutReplacement(choices: any[], number = 1) {
    if (choices.length === 0) return [];
    const table = new LootTable(choices);
    return table.chooseWithoutReplacement(number);
  }

  // try to drop each item in the loot table
  private tryEachItem(choices: any[]) {
    if (choices.length === 0) return [];
    const table = new LootTable(choices);
    return table.tryToDropEachItem(0);
  }

  // filter out things that can't actually drop. basically, just holiday stuff
  private filterDropTable(dropTable: any[]) {
    return dropTable.filter(item => item.requireHoliday ? this.game.holidayHelper.isHoliday(item.requireHoliday) : true);
  }

  // depending on the npc, they may boost their drop rates
  private getNPCBonusMultiplier(npc: INPC): number {
    if (npc.name.includes('elite')) return 2;
    return 1;
  }

  public getNPCLoot(npc: INPC, bonus = 0): ISimpleItem[] {

    const { map } = this.game.worldManager.getMap(npc.map);
    const { mapDroptables, regionDroptables } = map;

    // npcs can give bonuses in certain circumstances
    const npcBonus = this.getNPCBonusMultiplier(npc);
    bonus *= npcBonus;

    const isNaturalResource = npc.allegiance === Allegiance.NaturalResource;

    const rolledResults: any[] = [];

    // get region drops
    if (!isNaturalResource && regionDroptables.length > 0) {
      rolledResults.push(...this.tryEachItem(this.filterDropTable(regionDroptables)));
    }

    // get map drops
    if (!isNaturalResource && mapDroptables.length > 0) {
      rolledResults.push(...this.tryEachItem(this.filterDropTable(mapDroptables)));
    }

    // get npc drops
    if ((npc.drops?.length ?? 0) > 0) {
      rolledResults.push(...this.tryEachItem(this.filterDropTable(npc.drops ?? [])));
    }

    // check what they're guaranteed to drop
    if ((npc.copyDrops?.length ?? 0) > 0) {

      // make a rollable object out of copyDrops
      const drops = (npc.copyDrops ?? []).map(({ result, chance }) => {

        // hands are always dropped...
        if (result.includes('Hand')) return;

        // grab the item if it exists
        const item = get(npc.items, result);
        if (!item) return null;

        return { result: item.name, chance };
      }).filter(Boolean);

      // roll the drops if we have any
      if (drops.length > 0) {
        rolledResults.push(...this.tryEachItem(this.filterDropTable(drops)));
      }
    }

    // check npc drop pools
    // drop pools are special because you always get X of Y items guaranteed
    // not everything is randomly dropped
    if (npc.dropPool) {
      const { items, choose, replace } = npc.dropPool;
      const numChoices = random(choose.min, choose.max);
      if (numChoices > 0 && items.length > 0) {

        const filtered = this.filterDropTable(items);
        const results = replace ? this.chooseWithReplacement(filtered) : this.chooseWithoutReplacement(filtered);

        rolledResults.push(...results);
      }
    }

    // roll all of the items
    const rolledItems: ISimpleItem[] = rolledResults.map(x => this.game.itemCreator.getSimpleItem(x));

    // we always drop the hands - the golden rule
    if (npc.items.equipment[ItemSlot.RightHand]) rolledItems.push(npc.items.equipment[ItemSlot.RightHand] as ISimpleItem);
    if (npc.items.equipment[ItemSlot.LeftHand]) rolledItems.push(npc.items.equipment[ItemSlot.LeftHand] as ISimpleItem);

    return rolledItems;
  }

}
