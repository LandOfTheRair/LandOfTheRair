import { Parser } from 'muud';
import { Game } from '../../../../helpers';
import { Currency, GameAction, IAIBehavior, INPC, ISimpleItem, IVendorBehavior, IVendorItem } from '../../../../interfaces';

export class VendorBehavior implements IAIBehavior {

  private formattedVendorItems: ISimpleItem[] = [];
  private formattedVendorDailyItems: ISimpleItem[] = [];

  public get vendorItems() {
    return this.formattedVendorItems;
  }

  public get vendorDailyItems() {
    return this.formattedVendorDailyItems;
  }

  init(game: Game, npc: INPC, parser: Parser, behavior: IVendorBehavior) {

    const npcVendorItems = (behavior.vendorItems || []).map(i => this.reformatItem(game, npc, i, -1)).filter(Boolean);
    const npcVendorDailyItems = (behavior.dailyVendorItems || []).map((i, idx) => this.reformatItem(game, npc, i, idx)).filter(Boolean);

    this.formattedVendorItems = npcVendorItems as ISimpleItem[];
    this.formattedVendorDailyItems = npcVendorDailyItems as ISimpleItem[];

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {

        env?.callbacks.emit({
          action: GameAction.NPCActionShowVendor,
          npcUUID: npc.uuid,
          npcName: npc.name,
          npcSprite: npc.sprite,
          npcVendorCurrency: behavior.vendorCurrency || Currency.Gold,
          npcVendorItems,
          npcVendorDailyItems
        });

        return `Hello, ${env?.player.name}!`;
      });
  }

  tick() {}

  private reformatItem(game: Game, npc: INPC, vItem: IVendorItem, dailySlot: number): ISimpleItem | null {
    const base: any = { name: vItem.item, mods: {} };
    if (dailySlot >= 0) {
      base.uuid = `daily-${npc.map}-${npc.name}-${dailySlot}-${vItem.item}`;
    }

    const baseItem = game.itemHelper.getItemDefinition(vItem.item);
    if (!baseItem) {
      game.logger.error(`Vendor:${npc.name}`, `Could not get item definition for ${vItem.item}.`);
      return null;
    }

    base.mods.value = baseItem.value;

    if (vItem.valueMult) base.mods.value *= vItem.valueMult;
    if (vItem.valueSet) base.mods.value = vItem.valueSet;

    return base;
  }
}
