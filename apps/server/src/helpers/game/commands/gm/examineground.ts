import { get, isNumber } from 'lodash';

import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { GameServerResponse } from '@lotr/interfaces';

export class GMExamineGround extends MacroCommand {
  override aliases = ['@examineground', '@exground', '@exg'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [itemClass, arraySlot, drill] = args.arrayArgs;

    const ground = this.game.worldManager
      .getMap(player.map)
      ?.state.getEntireGround(player.x, player.y);
    if (!ground) {
      this.sendMessage(player, 'No ground here!');
      return;
    }

    let examineTarget = ground;

    if (itemClass) {
      examineTarget = ground[itemClass];
    }

    if (isNumber(+arraySlot) && !isNaN(+arraySlot)) {
      examineTarget = ground[itemClass][+arraySlot];
    }

    if (drill) {
      examineTarget = get(ground[itemClass][+arraySlot], drill);
    }

    this.sendMessage(
      player,
      `Examine Ground: ${itemClass}[${arraySlot}] (${drill || 'all'}):`,
    );
    this.sendMessage(player, '===');
    this.sendMessage(player, `\`${JSON.stringify(examineTarget, null, 2)}\``);
    this.sendMessage(player, '===');

    args.callbacks.emit({
      type: GameServerResponse.SendAlert,
      title: `Examine Ground: ${itemClass}[${arraySlot}] (${drill || 'all'}):`,
      content: JSON.stringify(examineTarget, null, 2),
    });
  }
}
