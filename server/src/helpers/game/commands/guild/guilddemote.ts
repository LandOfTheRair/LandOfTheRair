import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand, Player } from '../../../../models';

export class GuildDemote extends MacroCommand {
  override aliases = ['guild demote'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.guildManager.demoteMember(player as Player, args.stringArgs);
  }
}
