import {
  ICharacter,
  IMacroCommandArgs,
  IPlayer,
  ISimpleItem,
  ItemSlot,
} from '../../../../interfaces';
import { MacroCommand, Player } from '../../../../models';

export class Place extends MacroCommand {
  override aliases = ['place'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(char: ICharacter, args: IMacroCommandArgs) {
    let query = args.stringArgs;
    if (query.includes(' in')) query = query.split(' in').join('');
    if (query.includes(' on')) query = query.split(' on').join('');

    let [itemTypeOrName, container] = query.split(' ');

    itemTypeOrName = itemTypeOrName.toLowerCase().split(' ').join('');
    container = (container || 'sack').toLowerCase();

    const rightHand = char.items.equipment[ItemSlot.RightHand];
    const leftHand = char.items.equipment[ItemSlot.LeftHand];

    const { name: rightName, itemClass: rightClass } =
      this.game.itemHelper.getItemProperties(rightHand, ['name', 'itemClass']);
    const { name: leftName, itemClass: leftClass } =
      this.game.itemHelper.getItemProperties(leftHand, ['name', 'itemClass']);

    let item: ISimpleItem;
    let hand: 'left' | 'right';

    if (
      rightHand &&
      (rightClass?.toLowerCase() === itemTypeOrName ||
        itemTypeOrName === 'right' ||
        rightName?.toLowerCase().split(' ').join('').includes(itemTypeOrName))
    ) {
      hand = 'right';
      item = rightHand;
    }

    if (
      leftHand &&
      (leftClass?.toLowerCase() === itemTypeOrName ||
        itemTypeOrName === 'left' ||
        leftName?.toLowerCase().split(' ').join('').includes(itemTypeOrName))
    ) {
      hand = 'left';
      item = leftHand;
    }

    if (container === 'ground') {
      if (hand! === 'right') {
        this.game.commandHandler.doCommand(
          char as Player,
          { command: `!RtG` },
          args.callbacks,
        );
      }

      if (hand! === 'left') {
        this.game.commandHandler.doCommand(
          char as Player,
          { command: `!LtG` },
          args.callbacks,
        );
      }

      return;
    }

    if (!['belt', 'sack', 'pouch'].includes(container)) {
      return this.sendMessage(char, 'Invalid container.');
    }
    if (!item!) return;

    if (
      container === 'sack' &&
      !this.game.inventoryHelper.addItemToSack(char, item)
    ) {
      return;
    }
    if (
      container === 'belt' &&
      !this.game.inventoryHelper.addItemToBelt(char, item)
    ) {
      return;
    }
    if (
      container === 'pouch' &&
      !this.game.inventoryHelper.addItemToPouch(char as IPlayer, item)
    ) {
      return;
    }

    if (hand! === 'right') {
      this.game.characterHelper.setRightHand(char, undefined);
    } else this.game.characterHelper.setLeftHand(char, undefined);
  }
}
