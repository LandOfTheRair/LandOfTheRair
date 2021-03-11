
import { IMacroCommandArgs, IPlayer, ItemClass } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class DepositAllCommand extends MacroCommand {

  aliases = ['depositall'];

  execute(player: IPlayer, args: IMacroCommandArgs) {

    let materialsDeposited = 0;

    const removeItemUUIDs: string[] = [];

    player.items.sack.items.forEach(item => {
      const materialRef = this.game.lockerHelper.getMaterialRef(item.name);
      if (!materialRef) return;

      const materialSpaceLeft = this.game.inventoryHelper.materialSpaceLeft(player, materialRef);

      const { withdrawInOunces } = this.game.lockerHelper.getMaterialData(materialRef);
      if (withdrawInOunces) {
        const totalOz = this.game.itemHelper.getItemProperty(item, 'ounces') ?? 1;
        const takeOz = Math.min(materialSpaceLeft, totalOz);

        item.mods.ounces = totalOz - takeOz;
        this.game.inventoryHelper.addMaterial(player, materialRef, takeOz);

        if (item.mods.ounces <= 0) {
          removeItemUUIDs.push(item.uuid);
        }

        materialsDeposited += takeOz;

      } else {
        this.game.inventoryHelper.addMaterial(player, materialRef, 1);
        materialsDeposited += 1;
        removeItemUUIDs.push(item.uuid);

      }
    });

    if (materialsDeposited === 0) {
      this.sendMessage(player, 'You did not have any materials to deposit.');
    } else {
      this.sendMessage(player, `Deposited ${materialsDeposited.toLocaleString()} items.`);
    }

    this.game.inventoryHelper.removeItemsFromSackByUUID(player, removeItemUUIDs);

  }

}
