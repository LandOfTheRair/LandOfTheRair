import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMWallWalk extends MacroCommand {
  override aliases = ['@wallwalk', '@ww'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (this.game.effectHelper.hasEffect(player, 'WallWalk')) {
      this.game.effectHelper.removeEffectByName(player, 'WallWalk');
      return;
    }

    this.game.effectHelper.addEffect(player, '', 'WallWalk');
  }
}
