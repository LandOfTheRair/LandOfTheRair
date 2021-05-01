import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { Song } from './song';

export class PowerBalladSong extends Song {

  override aliases = ['song powerballadsong'];
  override spellRef = 'PowerBalladSong';

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (this.game.effectHelper.hasEffect(player, 'PowerBalladSong')) {
      this.game.effectHelper.removeEffectByName(player, 'PowerBalladSong');
      return;
    }

    super.execute(player, args);
  }

}
