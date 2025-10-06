import { cloneDeep } from 'lodash';

import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMDuplicateItem extends MacroCommand {
  override aliases = ['@duplicate', '@dupe', '@d'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const rightHand = player.items.equipment[ItemSlot.RightHand];
    if (!rightHand) {
return this.sendMessage(
        player,
        'You need to hold something in your right hand.',
      );
}

    const leftHand = player.items.equipment[ItemSlot.LeftHand];
    if (leftHand) {
return this.sendMessage(player, 'You need to empty your left hand.');
}
    const item = cloneDeep(rightHand);
    this.game.itemCreator.resetUUID(item);

    this.game.characterHelper.setLeftHand(player, item);
    this.sendMessage(player, `Duplicated ${item.name}.`);
  }
}
