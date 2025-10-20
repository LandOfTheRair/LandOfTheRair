import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class DanceEmote extends MacroCommand {
  override aliases = ['dance'];
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
      this.sendChatMessage(player, 'You dance!');
      playersInView
        .filter((element) => element !== player)
        .forEach((p) => {
          this.sendChatMessage(p, `${player.name} dances!`);
        });
      return;
    }

    this.sendChatMessage(player, `You dance with ${target.name}!`);
    this.sendChatMessage(target, `${player.name} dances with you!`);
    playersInView
      .filter((element) => element !== player && element !== target)
      .forEach((p) => {
        this.sendChatMessage(p, `${player.name} dances with ${target.name}!`);
      });
  }
}
