import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { Song } from './song';

export class AriaOfRefugeSong extends Song {

  override aliases = ['song ariaofrefugesong'];
  override spellRef = 'AriaOfRefugeSong';

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (this.game.effectHelper.hasEffect(player, 'AriaOfRefugeSong')) {
      this.game.effectHelper.removeEffectByName(player, 'AriaOfRefugeSong');
      return;
    }

    super.execute(player, args);
  }

}
