import { MacroCommand } from '@lotr/core';
import type { IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';

export class GuildDisband extends MacroCommand {
  override aliases = ['guild disband'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer) {
    this.game.guildManager.disbandGuild(player as Player);
  }
}
