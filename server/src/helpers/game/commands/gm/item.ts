import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMCreateItem extends MacroCommand {

  aliases = ['@item'];
  isGMCommand = true;
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {

    const itemName = args.stringArgs;
    if (!itemName) return this.sendMessage(player, 'You cannot create nothing.');
    if (player.items.equipment[ItemSlot.RightHand]) return this.sendMessage(player, 'Empty your right hand first.');

    try {
      const item = this.game.itemCreator.getSimpleItem(itemName);
      this.game.characterHelper.setRightHand(player, item);
    } catch (e) {
      return this.sendMessage(player, 'That item does not exist.');
    }
  }
}
