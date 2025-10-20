import { isDead } from '@lotr/characters';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class RestoreCommand extends MacroCommand {
  override aliases = ['restore'];
  override canBeFast = true;
  override canUseWhileDead = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!isDead(player)) {
      this.sendMessage(player, "You aren't dead!");
      return;
    }

    this.sendMessage(
      player,
      "Your soul departs the scene of it's death and returns to the mortal realm...",
    );

    this.game.deathHelper.restore(player);
  }
}
