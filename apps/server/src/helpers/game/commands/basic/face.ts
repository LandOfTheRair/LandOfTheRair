import { transmissionActionSendAccount } from '@lotr/core';
import type { Direction, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { GameAction } from '@lotr/interfaces';
import { directionFromText } from '@lotr/shared';
import { MacroCommand } from '../../../../models/macro';

export class Face extends MacroCommand {
  override aliases = ['face'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const dir = args.stringArgs;
    if (!['n', 'w', 'e', 's'].includes(dir.toLowerCase())) {
      return this.sendMessage(player, 'Invalid direction.');
    }

    player.dir = directionFromText(dir.toUpperCase()) as Direction;

    transmissionActionSendAccount(player.username, GameAction.GamePatchPlayer, {
      player: { dir: player.dir },
    });
  }
}
