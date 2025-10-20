import { getEmptyHand } from '@lotr/characters';
import { itemPropertyGet } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer, ItemClass } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

export class UseCommand extends MacroCommand {
  override aliases = ['use', 'eat', 'consume'];
  override canBeFast = true;
  override canBeInstant = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const useItemInHand = (itemSlot: ItemSlot) => {
      const item = player.items.equipment[itemSlot];
      if (!item) {
        return this.sendMessage(player, "You don't have an item in that slot.");
      }
      this.game.itemHelper.useItemInSlot(player, itemSlot);
    };

    const [place, detail] = [args.arrayArgs[0] ?? '', args.arrayArgs[1] ?? ''];

    if (place === 'left') return useItemInHand(ItemSlot.LeftHand);
    if (place === 'right') return useItemInHand(ItemSlot.RightHand);
    if (place === 'potion') return useItemInHand(ItemSlot.Potion);
    if (place !== 'sack' && place !== 'ground' && place !== 'demimagicpouch') {
      this.sendMessage(player, "You can't use an item from there.");
      return;
    }
    const emptyHand = getEmptyHand(player);
    if (!emptyHand) {
      return this.sendMessage(player, 'Your hands are full.');
    }

    if (place === 'sack') {
      const slot = +(detail ?? 0);
      const item = player.items.sack.items[slot];
      if (item) {
        this.game.inventoryHelper.removeItemFromSack(player, slot);
        this.game.characterHelper.setEquipmentSlot(player, emptyHand, item);
        useItemInHand(emptyHand);
      } else {
        this.sendMessage(player, 'You reach into your sack, and grab air.');
      }
      return;
    }

    if (place === 'demimagicpouch') {
      const slot = +(detail ?? 0);
      const item = player.accountLockers.pouch.items[slot];
      if (item) {
        this.game.inventoryHelper.removeItemFromPouch(player, slot);
        this.game.characterHelper.setEquipmentSlot(player, emptyHand, item);
        useItemInHand(emptyHand);
      } else {
        this.sendMessage(player, 'You reach into your pouch, and grab air.');
      }
      return;
    }

    if (place === 'ground') {
      const [itemType, uuid] = (detail ?? '').split(':');
      const state = this.game.worldManager.getMap(player.map)?.state;
      if (!state) {
        return this.sendMessage(
          player,
          'You reach down to pick up the item, but the ground was missing.',
        );
      }

      const items = state.getItemsFromGround(
        player.x,
        player.y,
        itemType as ItemClass,
        uuid,
      );
      const groundItem = items[0];
      if (groundItem) {
        const oldUUID = groundItem.item.uuid;

        const item = this.game.itemCreator.rerollItem(groundItem.item, false);

        const itemDefType = itemPropertyGet(item, 'itemClass');
        this.game.characterHelper.setEquipmentSlot(player, emptyHand, item);
        state.removeItemFromGround(player.x, player.y, itemDefType, oldUUID);

        useItemInHand(emptyHand);
      } else {
        if (uuid) {
          return this.sendMessage(
            player,
            "You reach down to pick up the item, but it isn't there anymore.",
          );
        }

        if (itemType) {
          return this.sendMessage(
            player,
            `You reach down to pick up a type of ${itemType}, but you couldn't find one.`,
          );
        }

        return this.sendMessage(
          player,
          "You reach down to pick up an item, but you couldn't find one.",
        );
      }
    }
  }
}
