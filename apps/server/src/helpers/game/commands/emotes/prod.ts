import { MacroCommand, worldMapStateGetForCharacter } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class ProdEmote extends MacroCommand {
  override aliases = ['prod', 'poke'];
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
      this.sendChatMessage(player, 'You prod the air!');
      playersInView
        .filter((element) => element !== player)
        .forEach((p) => {
          this.sendChatMessage(p, `${player.name} prods the air!`);
        });
      return;
    }

    this.sendChatMessage(player, `You prod ${target.name}!`);
    this.sendChatMessage(target, `${player.name} prods you!`);
    playersInView
      .filter((element) => element !== player && element !== target)
      .forEach((p) => {
        this.sendChatMessage(p, `${player.name} prods ${target.name}!`);
      });
  }
}
