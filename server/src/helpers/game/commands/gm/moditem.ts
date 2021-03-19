
import { merge } from 'lodash';

import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMModItem extends MacroCommand {

  aliases = ['@moditem', '@itemmod'];
  isGMCommand = true;
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {

    const rightHand = player.items.equipment[ItemSlot.RightHand];
    if (!rightHand) return this.sendMessage(player, 'You need to hold something in your right hand.');

    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: X=Y Z=A');
      return;
    }

    const formattedArgs = this.game.messageHelper.getMergeObjectFromArgs(args.stringArgs);
    merge(rightHand.mods, formattedArgs);
  }
}
