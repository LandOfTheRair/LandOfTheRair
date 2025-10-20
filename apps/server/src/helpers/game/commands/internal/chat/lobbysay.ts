import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class LobbySay extends MacroCommand {
  override aliases = ['lobbysay'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const msg = this.game.messageHelper.truncateMessage(
      this.game.profanityHelper.cleanMessage(args.stringArgs),
    );
    this.game.messageHelper.broadcastChatMessage(player, msg);
  }
}
