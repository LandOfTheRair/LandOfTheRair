import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Write extends MacroCommand {

  override aliases = ['write', 'inscribe'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    const right = player.items.equipment[ItemSlot.RightHand];
    const left = player.items.equipment[ItemSlot.LeftHand];

    const rightDesc = this.game.itemHelper.getItemProperty(right, 'desc');
    const leftName = this.game.itemHelper.getItemProperty(left, 'name');

    if (!right || rightDesc !== 'an empty scroll') return this.sendMessage(player, 'You need an empty scroll in your right hand!');
    if (!left || leftName !== 'Ink Vial') return this.sendMessage(player, 'You need an ink pot in your left hand!');

    right.mods.desc = `a scroll inscribed with text written in ink: "${args.stringArgs}"`;

    this.game.itemHelper.useItemInSlot(player, ItemSlot.LeftHand, false);

    this.sendMessage(player, 'You have inscribed your message successfully!');

  }
}
