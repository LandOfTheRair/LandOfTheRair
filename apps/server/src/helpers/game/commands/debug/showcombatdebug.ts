import type { IPlayer } from '@lotr/interfaces';
import { GameAction } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class ShowCombatDebug extends MacroCommand {
  override aliases = ['&showcombatdebug'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer) {
    this.game.transmissionHelper.sendActionToPlayer(
      player as Player,
      GameAction.SettingsShowWindow,
      { windowName: 'combatdebug' },
    );
  }
}
