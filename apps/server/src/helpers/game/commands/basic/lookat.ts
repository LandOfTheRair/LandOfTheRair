import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class LookAt extends MacroCommand {
  override aliases = ['lookat', 'consider'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );

    if (!target) {
      this.sendMessage(player, "You don't see that target!");
      return;
    }

    const description = `
    You are looking at a being named ${target.name}.
    The target is of ${(target.alignment || 'unknown').toLowerCase()} alignment.`;

    this.sendMessage(player, description);
  }
}
