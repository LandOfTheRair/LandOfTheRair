import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand, Player } from '../../../../models';

export class GuildPromote extends MacroCommand {
  override aliases = ['guild promote'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.guildManager.promoteMember(player as Player, args.stringArgs);
  }
}
