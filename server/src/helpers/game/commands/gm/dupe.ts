
import { cloneDeep } from 'lodash';

import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMDuplicateItem extends MacroCommand {

  aliases = ['@duplicate'];
  isGMCommand = true;
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {

    const rightHand = player.items.equipment[ItemSlot.RightHand];
    if (!rightHand) return this.sendMessage(player, 'You need to hold something in your right hand.');

    const leftHand = player.items.equipment[ItemSlot.LeftHand];
    if (leftHand) return this.sendMessage(player, 'You need to empty your left hand.');

    const item = cloneDeep(rightHand);
    this.game.itemCreator.resetUUID(item);

    this.game.characterHelper.setLeftHand(player, item);
    this.sendMessage(player, `Duplicated ${item.name}.`);

  }
}
