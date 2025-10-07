import { itemExists } from '@lotr/content';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
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

    if (!itemExists(itemName)) {
      this.sendMessage(player, 'That item does not exist.');
      return;
    }

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

    this.sendMessage(player, `You created ${args.stringArgs}.`);
  }
}
