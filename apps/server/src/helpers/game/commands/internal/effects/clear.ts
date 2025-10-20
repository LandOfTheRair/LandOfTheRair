import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../../models';

export class ClearCommand extends MacroCommand {
  override aliases = ['clear'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.playerHelper.clearActionQueue(player as Player);
    this.game.messageHelper.sendLogMessageToPlayer(player, {
      message: 'Command buffer and current target cleared.',
      setTarget: null,
    });
  }
}
