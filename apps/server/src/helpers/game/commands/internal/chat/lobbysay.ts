import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { cleanMessage, truncateMessage } from '@lotr/shared';

export class LobbySay extends MacroCommand {
  override aliases = ['lobbysay'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const msg = truncateMessage(cleanMessage(args.stringArgs));
    this.game.messageHelper.broadcastChatMessage(player, msg);
  }
}
