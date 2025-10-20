import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class LearnTrait extends MacroCommand {
  override aliases = ['learntrait'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const trait = args.stringArgs;

    if (!this.game.traitHelper.canLearnTrait(player, trait)) {
      return this.sendMessage(player, 'You cannot learn that trait.');
    }

    this.game.traitHelper.learnTrait(player, trait);

    this.sendMessage(
      player,
      `Your nature has expanded with knowledge of "${trait}"!`,
    );
  }
}
