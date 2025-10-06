import { hasEffect } from '@lotr/effects';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { Song } from './song';

export class PowerBalladSong extends Song {
  override aliases = ['song powerballadsong'];
  override spellRef = 'PowerBalladSong';

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'PowerBalladSong')) {
      this.game.effectHelper.removeEffectByName(player, 'PowerBalladSong');
      this.sendMessage(player, 'You stop singing.');
      return;
    }

    super.execute(player, args);
  }
}
