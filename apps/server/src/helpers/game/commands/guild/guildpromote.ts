import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';

export class GuildPromote extends MacroCommand {
  override aliases = ['guild promote'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.guildManager.promoteMember(player as Player, args.stringArgs);
  }
}
