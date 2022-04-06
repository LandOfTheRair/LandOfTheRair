import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class GMWallSight extends MacroCommand {

  override aliases = ['@wallsight', '@ws'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (this.game.effectHelper.hasEffect(player, 'WallSight')) {
      this.game.effectHelper.removeEffectByName(player, 'WallSight');
      this.game.visibilityHelper.calculatePlayerFOV(player as Player);
      return;
    }

    this.game.effectHelper.addEffect(player, '', 'WallSight');
    this.game.visibilityHelper.calculatePlayerFOV(player as Player);
  }
}
