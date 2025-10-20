import { MacroCommand, transmissionDataSendPlayer } from '@lotr/core';
import type { IPlayer } from '@lotr/interfaces';
import { GameAction } from '@lotr/interfaces';
import type { Player } from '../../../../models';

export class ShowCombatDebug extends MacroCommand {
  override aliases = ['&showcombatdebug'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer) {
    transmissionDataSendPlayer(
      player as Player,
      GameAction.SettingsShowWindow,
      { windowName: 'combatdebug' },
    );
  }
}
