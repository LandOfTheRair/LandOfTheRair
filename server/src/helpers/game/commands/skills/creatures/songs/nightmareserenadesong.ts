import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { Song } from './song';

export class NightmareSerenadeSong extends Song {

  override aliases = ['song nightmareserenadesong'];
  override spellRef = 'NightmareSerenadeSong';

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (this.game.effectHelper.hasEffect(player, 'NightmareSerenadeSong')) {
      this.game.effectHelper.removeEffectByName(player, 'NightmareSerenadeSong');
      return;
    }

    super.execute(player, args);
  }

}
