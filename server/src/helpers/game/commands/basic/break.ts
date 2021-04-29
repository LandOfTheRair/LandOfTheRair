import { IMacroCommandArgs, IPlayer, ItemSlot, SoundEffect } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Break extends MacroCommand {

  override aliases = ['break'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const handChoice = args.stringArgs;
    if (!handChoice) {
      this.sendMessage(player, 'You need to specify which hand has the item to break!');
      return;
    }

    let itemSlot: ItemSlot | null = null;
    switch (handChoice) {
    case 'left':
      itemSlot = ItemSlot.LeftHand;
      break;
    case 'right':
      itemSlot = ItemSlot.RightHand;
      break;
    default:
      this.sendMessage(player, 'That is not one of your hands! (left, or right)');
      return;
    }

    const item = player.items.equipment[itemSlot];
    if (!item) return this.sendMessage(player, 'You are not even holding an item there!');
    if (!this.game.itemHelper.isOwnedBy(player, item)) return this.sendMessage(player, 'That item is not yours to break!');

    // TODO: check if item has a destroy effect?
    this.game.characterHelper.setEquipmentSlot(player, itemSlot, undefined);

    this.sendMessage(player, `You break the ${item.name} in your ${handChoice} hand!`, SoundEffect.CombatBlockArmor);
  }
}
