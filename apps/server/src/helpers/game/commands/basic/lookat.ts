import { itemPropertyGet } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import {
  GameServerResponse,
  type IMacroCommandArgs,
  type IPlayer,
} from '@lotr/interfaces';
import { conditionString } from '@lotr/shared';

export class LookAt extends MacroCommand {
  override aliases = ['lookat', 'consider'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );

    if (!target) {
      this.sendMessage(player, "You don't see that person!");
      return;
    }

    const itemDescs = Object.keys(target.items.equipment).map((slot) => {
      const item = target.items.equipment[slot];
      const sprite = itemPropertyGet(item, 'sprite');
      if (!item || sprite === -1) return;

      const itemDesc = `· ${target.name} is ${slot.includes('Hand') ? 'holding' : 'wearing'}
        ${itemPropertyGet(item, 'desc')} (${conditionString(item)} condition)`;
      return itemDesc;
    });

    const description = `You are looking at a being named ${target.name}.<br><br>${itemDescs.join('<br>')}`;

    this.sendMessage(player, description.replace('<br>', '\n'));

    args.callbacks.emit({
      type: GameServerResponse.SendAlert,
      title: `Examine ${target.name}`,
      content: description,
    });
  }
}
