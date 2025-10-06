import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { MacroCommand } from '../../../../models';

export class GuildKick extends MacroCommand {
  override aliases = ['guild kick'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.guildManager.removeMember(player as Player, args.stringArgs);
  }
}
