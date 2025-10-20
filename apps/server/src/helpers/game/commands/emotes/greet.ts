import { MacroCommand, worldMapStateGetForCharacter } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class GreetEmote extends MacroCommand {
  override aliases = ['greet'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = worldMapStateGetForCharacter(player);
    if (!state) return;

    const playersInView = state.getAllPlayersInRange(player, 4);
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );

    if (!target || args.arrayArgs.length === 0 || target === player) {
      this.sendChatMessage(player, 'You greet those around you!');
      playersInView
        .filter((element) => element !== player)
        .forEach((p) => {
          this.sendChatMessage(p, `${player.name} greets those nearby!`);
        });
      return;
    }

    this.sendChatMessage(player, `You greet ${target.name}!`);
    this.sendChatMessage(target, `${player.name} greets you!`);
    playersInView
      .filter((element) => element !== player && element !== target)
      .forEach((p) => {
        this.sendChatMessage(p, `${player.name} greets ${target.name}!`);
      });
  }
}
