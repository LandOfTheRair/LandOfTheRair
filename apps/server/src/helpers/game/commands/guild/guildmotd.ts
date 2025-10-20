import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';

export class GuildMOTD extends MacroCommand {
  override aliases = ['guild setmotd'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.guildManager.updateMOTD(player as Player, args.stringArgs);
  }
}
