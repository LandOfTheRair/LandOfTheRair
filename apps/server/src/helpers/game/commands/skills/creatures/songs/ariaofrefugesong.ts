import { hasEffect } from '@lotr/effects';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { Song } from './song';

export class AriaOfRefugeSong extends Song {
  override aliases = ['song ariaofrefugesong'];
  override spellRef = 'AriaOfRefugeSong';

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'AriaOfRefugeSong')) {
      this.game.effectHelper.removeEffectByName(player, 'AriaOfRefugeSong');
      this.sendMessage(player, 'You stop singing.');
      return;
    }

    super.execute(player, args);
  }
}
