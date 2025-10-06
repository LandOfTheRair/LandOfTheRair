import { hasEffect } from '@lotr/effects';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { Song } from './song';

export class TranquilTrillSong extends Song {
  override aliases = ['song tranquiltrillsong'];
  override spellRef = 'TranquilTrillSong';

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'TranquilTrillSong')) {
      this.game.effectHelper.removeEffectByName(player, 'TranquilTrillSong');
      this.sendMessage(player, 'You stop singing.');
      return;
    }

    super.execute(player, args);
  }
}
