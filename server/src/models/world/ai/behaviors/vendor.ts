import { Parser } from 'muud';
import { Game } from '../../../../helpers';
import { Currency, GameAction, IAIBehavior, INPC, IPlayer, ISimpleItem, IVendorBehavior, IVendorItem } from '../../../../interfaces';

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

    if (npcVendorDailyItems.length === 0 && npcVendorItems.length === 0) {
      game.logger.error('Behavior:Vendor', `NPC at ${npc.map}-${npc.x},${npc.y} has no items to sell.`);
    }

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Please come closer.';

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
