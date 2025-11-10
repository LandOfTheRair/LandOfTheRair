import { itemPropertyGet } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class DepositAllCommand extends MacroCommand {
  override aliases = ['depositall'];

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    let materialsDeposited = 0;

    const depositedByName: Record<string, number> = {};

    const removeItemUUIDs: string[] = [];

    player.items.sack.items.forEach((item) => {
      const materialRef = this.game.lockerHelper.getMaterialRef(item.name);
      if (!materialRef) return;

      const materialSpaceLeft = this.game.inventoryHelper.materialSpaceLeft(
        player,
        materialRef,
      );
      if (materialSpaceLeft < 0) return;

      depositedByName[item.name] ??= 0;

      const { withdrawInOunces } =
        this.game.lockerHelper.getMaterialData(materialRef);

      if (withdrawInOunces) {
        const totalOz = itemPropertyGet(item, 'ounces') ?? 1;
        const takeOz = Math.min(materialSpaceLeft, totalOz);

        item.mods.ounces = totalOz - takeOz;
        this.game.inventoryHelper.addMaterial(player, materialRef, takeOz);

        if (item.mods.ounces <= 0) {
          removeItemUUIDs.push(item.uuid);
        }

        materialsDeposited += takeOz;
        depositedByName[item.name] += takeOz;
      } else {
        this.game.inventoryHelper.addMaterial(player, materialRef, 1);
        removeItemUUIDs.push(item.uuid);

        materialsDeposited += 1;
        depositedByName[item.name] += 1;
      }
    });

    if (materialsDeposited === 0) {
      this.sendMessage(player, 'You did not have any materials to deposit.');
    } else {
      const messages = [
        `Deposited ${materialsDeposited.toLocaleString()} items:`,
      ];

      Object.keys(depositedByName).forEach((itemName) => {
        const materialRef = this.game.lockerHelper.getMaterialRef(itemName);
        if (!materialRef) return;

        const deposited = depositedByName[itemName];
        const totalInStorage = this.game.inventoryHelper.materialSpaceLeft(
          player,
          materialRef,
        );

        messages.push(`- ${deposited}x ${itemName} (total: ${totalInStorage})`);
      });

      this.sendMessage(player, messages.join('<br>'));
    }

    this.game.inventoryHelper.removeItemsFromSackByUUID(
      player,
      removeItemUUIDs,
    );
  }
}
