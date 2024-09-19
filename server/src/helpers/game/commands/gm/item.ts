import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMCreateItem extends MacroCommand {
  override aliases = ['@createitem', '@item', '@i'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: ItemName');
      return;
    }

    const itemName = args.stringArgs;
    if (!itemName) {
      return this.sendMessage(player, 'You cannot create nothing.');
    }

    let hand: ItemSlot | null = ItemSlot.RightHand;
    if (player.items.equipment[hand]) hand = ItemSlot.LeftHand;
    if (player.items.equipment[hand]) hand = null;

    try {
      const item = this.game.itemCreator.getSimpleItem(itemName);

      if (hand) {
        this.game.characterHelper.setEquipmentSlot(player, hand, item);
      } else {
        this.game.groundManager.addItemToGround(
          player.map,
          player.x,
          player.y,
          item,
        );
      }
    } catch (e) {
      return this.sendMessage(player, 'That item does not exist.');
    }

    this.sendMessage(player, `You created ${args.stringArgs}.`);
  }
}
