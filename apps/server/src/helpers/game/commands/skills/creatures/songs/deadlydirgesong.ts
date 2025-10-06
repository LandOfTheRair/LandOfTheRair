import { hasEffect } from '@lotr/effects';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { Song } from './song';

export class DeadlyDirgeSong extends Song {
  override aliases = ['song deadlydirgesong'];
  override spellRef = 'DeadlyDirgeSong';

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'DeadlyDirgeSong')) {
      this.game.effectHelper.removeEffectByName(player, 'DeadlyDirgeSong');
      this.sendMessage(player, 'You stop singing.');
      return;
    }

    super.execute(player, args);
  }
}
