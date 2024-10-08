import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand, Player } from '../../../../models';

export class GuildAuditLog extends MacroCommand {
  override aliases = ['guild auditlog'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.guildManager.getAuditLog(player as Player);
  }
}
