import { SpellCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class Reincarnate extends SpellCommand {
  override aliases = ['reincarnate', 'cast reincarnate'];
  override requiresLearn = true;
  override spellRef = 'Reincarnate';
  override canTargetSelf = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const mapRef = this.game.worldManager.getMap(player.map);
    if (!mapRef) return;

    // in dungeon, fail
    if (this.game.worldManager.isDungeon(player.map)) {
      return this.sendMessage(
        player,
        'The flow of ether disrupts your concentration.',
      );
    }

    // check for valid boss spawners
    const validSpawners = mapRef.state.allSpawners.filter(
      (spawner) => spawner.areCreaturesDangerous && !spawner.areAnyNPCsAlive,
    );
    if (validSpawners.length === 0) {
      return this.sendMessage(
        player,
        'There is no lingering evil energy here.',
      );
    }

    this.castSpellAt(player, player, args);
  }
}
