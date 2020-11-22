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

    const npcVendorItems = (behavior.vendorItems || []).map(i => this.reformatItem(game, i));
    const npcVendorDailyItems = (behavior.dailyVendorItems || []).map(i => this.reformatItem(game, i));

    this.formattedVendorItems = npcVendorItems;
    this.formattedVendorDailyItems = npcVendorDailyItems;

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

  private reformatItem(game: Game, vItem: IVendorItem) {
    const base: any = { name: vItem.item, mods: {} };

    const baseItem = game.itemHelper.getItemDefinition(vItem.item);
    base.mods.value = baseItem.value;

    if (vItem.valueMult) base.mods.value *= vItem.valueMult;
    if (vItem.valueSet) base.mods.value = vItem.valueSet;

    return base;
  }
}
