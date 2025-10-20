import { hasLearned } from '@lotr/characters';
import { MacroCommand } from '@lotr/core';
import { getEffect } from '@lotr/effects';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class DezerkCommand extends MacroCommand {
  override aliases = ['dezerk'];

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!hasLearned(player, 'Berserk')) {
      this.sendMessage(player, 'Oog?');
      return;
    }

    const existingBerserk = getEffect(player, 'Berserk');

    if (!existingBerserk) {
      this.sendMessage(player, 'You are too zen for this action.');
      return;
    }

    const berserkRef = this.game.effectManager.getEffectRef('Berserk');
    berserkRef.downcast(existingBerserk, player, player);
  }
}
