import { SpellCommand } from '@lotr/core';
import { calculateXPRequiredForLevel } from '@lotr/exp';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class Fate extends SpellCommand {
  override aliases = ['fate', 'cast fate'];
  override requiresLearn = true;
  override spellRef = 'Fate';
  override canTargetSelf = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (player.exp < calculateXPRequiredForLevel(15) || player.level < 15) {
      return this.sendMessage(
        player,
        'Hmmm... you feel too inexperienced for this.',
      );
    }

    this.castSpellAt(player, player, args);
  }
}
