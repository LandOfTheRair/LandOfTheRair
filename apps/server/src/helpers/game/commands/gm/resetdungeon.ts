import { coreRNGDungeonConfig } from '@lotr/content';
import { MacroCommand, worldGetMapAndState } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

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
    const mapData = worldGetMapAndState(map);

    if (!mapData) {
      this.sendMessage(player, 'That is not a valid map name.');
      return;
    }

    const mapConfig = coreRNGDungeonConfig().dungeonConfigs.find(
      (x) => x.name === map,
    );
    if (!mapConfig) {
      this.sendMessage(player, 'There is not a valid map config for that map.');
      return;
    }

    this.sendMessage(player, `Resetting ${map} with seed "${seed}".`);
    this.game.rngDungeonManager.generateDungeon(mapConfig, seed);
  }
}
