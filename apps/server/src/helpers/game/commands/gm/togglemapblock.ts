import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class GMToggleMapBlock extends MacroCommand {
  override aliases = ['@blockmap', '@unblockmap', '@togglemapblock', '@tmb'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: MapName');
      return;
    }

    const map = args.stringArgs.split(' ')[0];
    const mapData = this.game.worldManager.getMap(map);

    if (!mapData) {
      this.sendMessage(player, 'That is not a valid map name.');
      return;
    }

    mapData.map.properties.blockEntry = !mapData.map.properties.blockEntry;
    this.sendMessage(
      player,
      `${map} is: ${mapData.map.properties.blockEntry ? 'blocked' : 'unblocked'}.`,
    );

    this.game.worldManager.getPlayersInMap(map).forEach((p) => {
      this.game.teleportHelper.teleportToRespawnPoint(p as Player);
      this.sendMessage(p, 'The ether forces you out of your current location!');
    });
  }
}
