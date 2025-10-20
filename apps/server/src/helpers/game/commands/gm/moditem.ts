import { merge } from 'lodash';

import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

export class GMModItem extends MacroCommand {
  override aliases = ['@moditem', '@itemmod', '@mi'];
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

    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: X=Y Z=A');
      return;
    }

    const formattedArgs = this.game.messageHelper.getMergeObjectFromArgs(
      args.stringArgs,
    );
    merge(rightHand.mods, formattedArgs);

    this.game.characterHelper.recalculateEverything(player);

    this.sendMessage(
      player,
      `Modified right hand: ${JSON.stringify(formattedArgs)}`,
    );
  }
}
