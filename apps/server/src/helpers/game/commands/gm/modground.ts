import { isNumber, merge } from 'lodash';

import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMModGround extends MacroCommand {
  override aliases = ['@modground', '@modg', '@mg'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [itemClass, arraySlot, mods] = args.arrayArgs;

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

    if (!mods) {
      this.sendMessage(player, 'Syntax: X=Y Z=A');
      return;
    }

    const formattedArgs = this.game.messageHelper.getMergeObjectFromArgs(mods);
    merge(examineTarget, formattedArgs);

    this.sendMessage(
      player,
      `Modified groundItem: ${JSON.stringify(formattedArgs)}`,
    );
  }
}
