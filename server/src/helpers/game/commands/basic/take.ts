
import { capitalize } from 'lodash';

import { ICharacter, IMacroCommandArgs, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Take extends MacroCommand {

  override aliases = ['take'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(char: ICharacter, args: IMacroCommandArgs) {

    const rightHand = char.items.equipment[ItemSlot.RightHand];
    const leftHand = char.items.equipment[ItemSlot.LeftHand];

    if (rightHand && leftHand) return this.sendMessage(char, 'Your hands are full.');

    let query = args.stringArgs;
    if (query.includes(' from')) query = query.split(' from').join('');

    let [itemTypeOrName, container] = query.split(' ');

    itemTypeOrName = itemTypeOrName.toLowerCase().split(' ').join('');
    container = (container || 'sack').toLowerCase();

    if (!['belt', 'sack', 'pouch'].includes(container)) return this.sendMessage(char, 'Invalid container.');

    const containerItems = char.items[container].items;
    let takeItemSlot = -1;

    for (let i = containerItems.length; i >= 0; i--) {
      if (takeItemSlot >= 0) continue;

      const checkItem = containerItems[i];
      if (!checkItem) continue;

      const { name, itemClass } = this.game.itemHelper.getItemProperties(checkItem, ['name', 'itemClass']);

      if (itemTypeOrName === 'any') takeItemSlot = i;
      if (itemClass?.toLowerCase() === itemTypeOrName) takeItemSlot = i;
      if (name?.toLowerCase().split(' ').join('').includes(itemTypeOrName)) takeItemSlot = i;
    }

    if (takeItemSlot === -1) return this.sendMessage(char, 'Item was not found.');

    const item = char.items[container].items[takeItemSlot];
    if (!item) return;

    this.game.inventoryHelper[`removeItemFrom${capitalize(container)}`](char, takeItemSlot);

    if (!rightHand) this.game.characterHelper.setRightHand(char, item);
    else            this.game.characterHelper.setLeftHand(char, item);

    // this.game.commandHandler.doCommand(char as Player, { command: `~${capitalize(hand).substring(0, 1)}tB` }, args.callbacks);
  }
}
