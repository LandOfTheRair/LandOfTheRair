import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { Song } from './song';

export class TranquilTrillSong extends Song {

  override aliases = ['song tranquiltrillsong'];
  override spellRef = 'TranquilTrillSong';

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (this.game.effectHelper.hasEffect(player, 'TranquilTrillSong')) {
      this.game.effectHelper.removeEffectByName(player, 'TranquilTrillSong');
      return;
    }

    super.execute(player, args);
  }

}
