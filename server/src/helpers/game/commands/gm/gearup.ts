import { sortBy } from 'lodash';
import {
  EquipHash,
  IMacroCommandArgs,
  IPlayer,
  ItemSlot,
  Stat,
} from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMGearUp extends MacroCommand {
  override aliases = ['@gearup', '@gear', '@gu'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [stat, level] = args.arrayArgs;

    const cleanLevel = this.game.userInputHelper.cleanNumber(level, 1, {
      floor: true,
      abs: true,
    });

    if (!Object.values(Stat).includes(stat as Stat)) {
      this.sendMessage(player, 'Invalid stat.');
      return;
    }

    const validItems = Object.values(this.game.contentManager.allItems).filter(
      (i) => (i.requirements?.level ?? 0) <= cleanLevel,
    );

    const slotsToFill = [
      ItemSlot.Armor,
      ItemSlot.Robe,
      ItemSlot.Head,
      ItemSlot.Neck,
      ItemSlot.Ear,
      ItemSlot.Waist,
      ItemSlot.Wrists,
      ItemSlot.Ring,
      ItemSlot.Hands,
      ItemSlot.Feet,
    ];

    slotsToFill.forEach((itemSlot) => {
      const slotItems = validItems.filter(
        (i) => EquipHash[i.itemClass] === itemSlot,
      );
      const validItemsForSlot = sortBy(slotItems, [
        (i) => -i.stats?.[stat],
        (i) => i.requirements?.level ?? 0,
      ]);

      let chosenItem;
      const chosenItemDef = validItemsForSlot[0];
      if (chosenItemDef) {
        chosenItem = this.game.itemCreator.getSimpleItem(chosenItemDef.name);
        chosenItem.mods.owner = player.username;
      }

      if (itemSlot === ItemSlot.Ring) {
        this.game.characterHelper.setEquipmentSlot(
          player,
          ItemSlot.Ring1,
          chosenItem,
        );
        this.game.characterHelper.setEquipmentSlot(
          player,
          ItemSlot.Ring2,
          chosenItem,
        );
        return;
      }

      if (itemSlot === ItemSlot.Robe) {
        this.game.characterHelper.setEquipmentSlot(
          player,
          ItemSlot.Robe1,
          chosenItem,
        );
        this.game.characterHelper.setEquipmentSlot(
          player,
          ItemSlot.Robe2,
          chosenItem,
        );
        return;
      }

      this.game.characterHelper.setEquipmentSlot(player, itemSlot, chosenItem);
    });
  }
}
