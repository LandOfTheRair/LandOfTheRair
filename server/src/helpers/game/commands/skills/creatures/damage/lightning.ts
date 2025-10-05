import {
  IMacroCommandArgs,
  IPlayer,
  SoundEffect,
} from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

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
