import { get } from 'lodash';

import {
  GameServerResponse,
  IMacroCommandArgs,
  IPlayer,
  ItemSlot,
} from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMExamineItem extends MacroCommand {
  override aliases = ['@examineitem', '@exitem', '@exi'];
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

    let displayValue = rightHand;
    if (args.stringArgs) {
      displayValue =
        get(rightHand, args.stringArgs, null) ||
        get(
          this.game.itemHelper.getItemDefinition(rightHand.name),
          args.stringArgs,
          null,
        );
    }

    this.sendMessage(
      player,
      `Examine ${rightHand.name} (${args.stringArgs || 'all'}):`,
    );
    this.sendMessage(player, '===');
    this.sendMessage(player, `\`${JSON.stringify(displayValue, null, 2)}\``);
    this.sendMessage(player, '===');

    args.callbacks.emit({
      type: GameServerResponse.SendAlert,
      title: `Examine ${rightHand.name} (${args.stringArgs || 'all'}):`,
      content: JSON.stringify(displayValue, null, 2),
    });
  }
}
