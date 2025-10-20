import { SpellCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { SoundEffect } from '@lotr/interfaces';

export class Lightning extends SpellCommand {
  override aliases = ['lightning', 'cast lightning'];

  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'Lightning';

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.messageHelper.sendLogMessageToRadius(player, 8, {
      message: 'You hear the crackling of lightning.',
      sfx: SoundEffect.SpellAOELightning,
    });

    super.execute(player, args);
  }
}
