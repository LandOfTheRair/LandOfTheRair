import { hasEffect } from '@lotr/effects';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class GMWallSight extends MacroCommand {
  override aliases = ['@wallsight', '@ws'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (hasEffect(player, 'WallSight')) {
      this.game.effectHelper.removeEffectByName(player, 'WallSight');
      this.game.visibilityHelper.calculatePlayerFOV(player as Player);
      return;
    }

    this.game.effectHelper.addEffect(player, '', 'WallSight');
    this.game.visibilityHelper.calculatePlayerFOV(player as Player);
  }
}
