import { MacroCommand } from '@lotr/core';
import type { IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';

export class GuildInviteAccept extends MacroCommand {
  override aliases = ['guild inviteaccept'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer) {
    this.game.guildManager.acceptInvite(player as Player);
  }
}
