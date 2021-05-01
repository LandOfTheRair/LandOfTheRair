import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { Song } from './song';

export class WistfulFugueSong extends Song {

  override aliases = ['song wistfulfuguesong'];
  override spellRef = 'WistfulFugueSong';

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (this.game.effectHelper.hasEffect(player, 'WistfulFugueSong')) {
      this.game.effectHelper.removeEffectByName(player, 'WistfulFugueSong');
      return;
    }

    super.execute(player, args);
  }

}
