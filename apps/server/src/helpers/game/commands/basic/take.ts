import { capitalize } from 'lodash';

import { itemPropertiesGet } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type {
  ICharacter,
  IMacroCommandArgs,
  ISimpleItem,
} from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
import type { Player } from '../../../../models';

export class Take extends MacroCommand {
  override aliases = ['take'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(char: ICharacter, args: IMacroCommandArgs) {
    const rightHand = char.items.equipment[ItemSlot.RightHand];
    const leftHand = char.items.equipment[ItemSlot.LeftHand];

    if (rightHand && leftHand) {
      return this.sendMessage(char, 'Your hands are full.');
    }

    let query = args.stringArgs;
    if (query.includes(' from')) query = query.split(' from').join('');

    let [itemTypeOrName, container] = query.split(' ');

    itemTypeOrName = itemTypeOrName.split(' ').join('');
    container = (container || 'sack').toLowerCase();

    let item: ISimpleItem | undefined;

    if (container === 'ground') {
      if (!rightHand) {
        this.game.commandHandler.doCommand(
          char as Player,
          { command: `!GtR`, args: `${itemTypeOrName}` },
          args.callbacks,
        );
      } else if (!leftHand) {
        this.game.commandHandler.doCommand(
          char as Player,
          { command: `!GtL`, args: `${itemTypeOrName}` },
          args.callbacks,
        );
      } else {
        this.sendMessage(char, 'No hands empty!');
      }

      return;
    } else {
      if (!['belt', 'sack', 'pouch'].includes(container)) {
        return this.sendMessage(char, 'Invalid container.');
      }

      const containerItems = char.items[container].items;
      let takeItemSlot = -1;

      for (let i = containerItems.length; i >= 0; i--) {
        if (takeItemSlot >= 0) continue;

        const checkItem = containerItems[i];
        if (!checkItem) continue;

        const { name, itemClass } = itemPropertiesGet(checkItem, [
          'name',
          'itemClass',
        ]);

        itemTypeOrName = itemTypeOrName.toLowerCase();
        if (itemTypeOrName === 'any') takeItemSlot = i;
        if (itemClass?.toLowerCase() === itemTypeOrName) takeItemSlot = i;
        if (name?.toLowerCase().split(' ').join('').includes(itemTypeOrName)) {
          takeItemSlot = i;
        }
      }

      if (takeItemSlot === -1) {
        return this.sendMessage(char, 'Item was not found.');
      }

      item = char.items[container].items[takeItemSlot];
      if (!item) return;

      this.game.inventoryHelper[`removeItemFrom${capitalize(container)}`](
        char,
        takeItemSlot,
      );
    }

    if (!item) return this.sendMessage(char, 'No matching item found.');

    if (!rightHand) this.game.characterHelper.setRightHand(char, item);
    else this.game.characterHelper.setLeftHand(char, item);
  }
}
