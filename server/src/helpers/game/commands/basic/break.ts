import { IMacroCommandArgs, IPlayer, ItemSlot, MessageType } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Break extends MacroCommand {

  override aliases = ['break'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    let message;
    const breakItem = args.stringArgs;
    if (!breakItem) {
      message = 'You need to specify which item to break!';
      this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);
      return;
    }

    // TODO: check if item has a destroy effect?

    switch (breakItem) {
    case 'left':
      const litem = player.items.equipment[ItemSlot.LeftHand];
      if (!litem) return this.sendMessage(player, 'You are not even holding an item there!');
      if (!this.game.itemHelper.isOwnedBy(player, litem)) return this.sendMessage(player, 'That item is not yours to break!');
      this.game.characterHelper.setLeftHand(player, undefined);
      message = 'You break the item in your left hand!';
      break;
    case 'right':
      const ritem = player.items.equipment[ItemSlot.RightHand];
      if (!ritem) return this.sendMessage(player, 'You are not even holding an item there!');
      if (!this.game.itemHelper.isOwnedBy(player, ritem)) return this.sendMessage(player, 'That item is not yours to break!');
      this.game.characterHelper.setRightHand(player, undefined);
      message = 'You break the item in your right hand!';
      break;
    default:
      message = 'That is not one of your hands!';
      break;
    }
    this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);
  }
}
