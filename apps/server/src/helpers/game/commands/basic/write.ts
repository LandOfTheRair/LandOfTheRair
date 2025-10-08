import { itemPropertyGet } from '@lotr/content';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Write extends MacroCommand {
  override aliases = ['write', 'inscribe'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const right = player.items.equipment[ItemSlot.RightHand];
    const left = player.items.equipment[ItemSlot.LeftHand];

    const rightDesc = itemPropertyGet(right, 'desc');
    const leftName = itemPropertyGet(left, 'name');

    if (!right) {
      return this.sendMessage(player, 'You need an item in your right hand!');
    }
    if (rightDesc.includes('written in ink')) {
      return this.sendMessage(player, 'You cannot write on that item again!');
    }
    if (!left || !leftName.includes('Ink Vial')) {
      return this.sendMessage(player, 'You need an ink pot in your left hand!');
    }

    if (rightDesc === 'an empty scroll') {
      right.mods.desc = `a scroll inscribed with text written in ink: "${args.stringArgs}"`;
    } else {
      right.mods.desc = `${rightDesc} with "${args.stringArgs}" written in ink`;
    }

    this.game.itemHelper.useItemInSlot(player, ItemSlot.LeftHand, false);

    this.sendMessage(player, 'You have inscribed your message successfully!');
  }
}
