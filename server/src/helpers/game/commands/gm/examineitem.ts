import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMExamineItem extends MacroCommand {

  override aliases = ['@exitem'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const rightHand = player.items.equipment[ItemSlot.RightHand];
    if (!rightHand) return this.sendMessage(player, 'You need to hold something in your right hand.');

    this.sendMessage(player, `Examine ${rightHand.name}:`);
    this.sendMessage(player, '===');
    this.sendMessage(player, `\`${JSON.stringify(rightHand, null, 2)}\``);
    this.sendMessage(player, '===');
  }
}
