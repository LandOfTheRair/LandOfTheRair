
import { IMacroCommandArgs, IPlayer, ItemClass, ItemSlot } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class UseCommand extends MacroCommand {

  aliases = ['use', 'eat', 'consume'];
  canBeFast = true;
  canBeInstant = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const useItemInHand = (itemSlot: ItemSlot) => {
      this.game.itemHelper.useItemInSlot(player, itemSlot);
    };

    const [context, slot] = args.arrayArgs;

    if (context === 'left')  return useItemInHand(ItemSlot.LeftHand);
    if (context === 'right') return useItemInHand(ItemSlot.RightHand);

    if (!this.game.characterHelper.hasEmptyHand(player)) return this.sendMessage(player, 'Your hands are full.');

    const emptyHand = player.items.equipment[ItemSlot.RightHand] ? ItemSlot.LeftHand : ItemSlot.RightHand;

    switch (context) {

      case 'sack': {
        const item = player.items.sack.items[+slot];
        this.game.playerInventoryHelper.removeItemFromSack(player, +slot);
        this.game.characterHelper.setEquipmentSlot(player, emptyHand, item);
        useItemInHand(emptyHand);
        break;
      }

      case 'ground': {
        const [itemType, uuid] = slot.split(':');
        const { state } = this.game.worldManager.getMap(player.map);
        const items = state.getItemsFromGround(player.x, player.y, itemType as ItemClass, uuid);
        if (items[0]) {
          this.game.characterHelper.setEquipmentSlot(player, emptyHand, items[0].item);
          state.removeItemFromGround(player.x, player.y, itemType as ItemClass, uuid);
          useItemInHand(emptyHand);
        }
        break;
      }

      default: {
        this.sendMessage(player, 'You can\'t use that item from there.');
      }
    }
  }

}
