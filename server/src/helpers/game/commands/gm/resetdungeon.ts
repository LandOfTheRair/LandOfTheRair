import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMResetDungeon extends MacroCommand {

  override aliases = ['@resetdungeon', '@rd'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: MapName [Seed]');
      return;
    }

    const map = args.stringArgs.split(' ')[0];
    const seed = +args.stringArgs.split(' ')[1];
    const mapData = this.game.worldManager.getMap(map);

    if (!mapData) {
      this.sendMessage(player, 'That is not a valid map name.');
      return;
    }

    const mapConfig = this.game.contentManager.rngDungeonConfigData.dungeonConfigs.find(x => x.name === map);
    if (!mapConfig) {
      this.sendMessage(player, 'There is not a valid map config for that map.');
      return;
    }

    this.sendMessage(player, `Resetting ${map} with seed "${seed}".`);
    this.game.rngDungeonManager.generateDungeon(mapConfig, seed);
  }
}
