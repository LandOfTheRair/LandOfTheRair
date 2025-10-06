import type { IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { MacroCommand } from '../../../../models';

export class GuildLeave extends MacroCommand {
  override aliases = ['guild leave'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer) {
    this.game.guildManager.leaveGuild(player as Player);
  }
}
