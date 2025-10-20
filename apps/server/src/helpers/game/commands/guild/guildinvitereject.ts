import { MacroCommand } from '@lotr/core';
import type { IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';

export class GuildInviteReject extends MacroCommand {
  override aliases = ['guild invitereject'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer) {
    this.game.guildManager.denyInvite(player as Player);
  }
}
