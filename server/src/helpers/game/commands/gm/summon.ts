import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class GMSummon extends MacroCommand {

  aliases = ['@summon'];
  isGMCommand = true;
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {

    const target = args.stringArgs;
    if (!target) {
      this.sendMessage(player, 'Syntax: PlayerName');
      return;
    }

    const targetRefs = this.game.playerManager
      .getAllPlayers()
      .filter(checkPlayer => this.game.targettingHelper.doesTargetMatchSearch(checkPlayer, target));

    if (targetRefs.length === 0) {
      this.sendMessage(player, 'Could not find someone like that name.');
      return;
    }

    this.sendMessage(player, 'Woosh.');
    this.game.teleportHelper.teleport(targetRefs[0] as Player, { x: player.x, y: player.y, map: player.map });
  }
}
