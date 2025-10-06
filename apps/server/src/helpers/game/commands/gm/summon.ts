import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class GMSummon extends MacroCommand {
  override aliases = ['@summon', '@s'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = args.stringArgs;
    if (!target) {
      this.sendMessage(player, 'Syntax: PlayerName');
      return;
    }

    const targetRefs = this.game.playerManager
      .getAllPlayers()
      .filter((checkPlayer) =>
        this.game.targettingHelper.doesTargetMatchSearch(checkPlayer, target),
      );

    if (targetRefs.length === 0) {
      this.sendMessage(player, 'Could not find someone like that name.');
      return;
    }

    this.sendMessage(player, 'Woosh.');
    this.game.teleportHelper.teleport(targetRefs[0] as Player, {
      x: player.x,
      y: player.y,
      map: player.map,
    });
  }
}
