import { itemPropertyGet } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type { IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

export class DrinkCommand extends MacroCommand {
  override aliases = ['drink'];
  override canBeFast = true;
  override canBeInstant = true;

  override execute(player: IPlayer) {
    const allHealingEffects = ['ExactHeal', 'ExactHealRegen'];

    // try to use from potion first
    if (player.items.equipment[ItemSlot.Potion]) {
      this.game.itemHelper.useItemInSlot(player, ItemSlot.Potion);
      return;
    }

    // then right hand
    if (player.items.equipment[ItemSlot.RightHand]) {
      const useEffect = itemPropertyGet(
        player.items.equipment[ItemSlot.RightHand],
        'useEffect',
      );
      if (useEffect && allHealingEffects.includes(useEffect.name)) {
        this.game.itemHelper.useItemInSlot(player, ItemSlot.RightHand);
        return;
      }
    }

    // then left hand
    if (player.items.equipment[ItemSlot.LeftHand]) {
      const useEffect = itemPropertyGet(
        player.items.equipment[ItemSlot.LeftHand],
        'useEffect',
      );
      if (useEffect && allHealingEffects.includes(useEffect.name)) {
        this.game.itemHelper.useItemInSlot(player, ItemSlot.LeftHand);
        return;
      }
    }

    // as a last resort, we traverse the sack, then slot the first item we find in potion, then use it
    const firstHealIndex = player.items.sack.items.findIndex((i) => {
      const useEffect = itemPropertyGet(i, 'useEffect');
      if (!useEffect) return false;
      return allHealingEffects.includes(useEffect.name);
    });

    if (firstHealIndex === -1) {
      this.sendMessage(player, "You've got no potions to drink!");
      return;
    }

    // we equip the potion we found
    const item = player.items.sack.items[firstHealIndex];
    this.game.inventoryHelper.removeItemFromSack(player, firstHealIndex);
    this.game.characterHelper.setEquipmentSlot(player, ItemSlot.Potion, item);
    this.game.itemHelper.useItemInSlot(player, ItemSlot.Potion);
  }
}
