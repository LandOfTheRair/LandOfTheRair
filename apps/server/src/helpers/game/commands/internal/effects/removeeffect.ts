import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class RemoveEffectCommand extends MacroCommand {
  override aliases = ['removeeffect'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.effectHelper.removeEffectManually(
      player,
      args.stringArgs.trim(),
      true,
    );
  }
}
