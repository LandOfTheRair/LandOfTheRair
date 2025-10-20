import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class ScreamEmote extends MacroCommand {
  override aliases = ['scream'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = this.game.worldManager.getMapStateForCharacter(player);
    if (!state) return;

    const playersInView = state.getAllPlayersInRange(player, 4);
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );

    if (!target || args.arrayArgs.length === 0 || target === player) {
      this.sendChatMessage(player, 'You scream!');
      playersInView
        .filter((element) => element !== player)
        .forEach((p) => {
          this.sendChatMessage(p, `${player.name} screams!`);
        });
      return;
    }

    this.sendChatMessage(player, `You scream at ${target.name}!`);
    this.sendChatMessage(target, `${player.name} screams at you!`);
    playersInView
      .filter((element) => element !== player && element !== target)
      .forEach((p) => {
        this.sendChatMessage(p, `${player.name} screams at ${target.name}!`);
      });
  }
}
