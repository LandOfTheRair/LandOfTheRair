import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';

export class GMTeleport extends MacroCommand {
  override aliases = ['@teleport', '@t'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [x, y, map] = args.arrayArgs;
    if (!x || !y) {
      this.sendMessage(player, 'Syntax: X Y [Map]');
      return;
    }

    this.sendMessage(player, 'Woosh.');
    this.game.teleportHelper.teleport(player as Player, { x: +x, y: +y, map });

    this.game.playerHelper.refreshPlayerMapState(player as Player);
    this.game.playerManager.saveAllPlayers();
  }
}
