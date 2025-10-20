import { isPlayer } from '@lotr/characters';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import type { Player } from '../../../../models';

export class GMSend extends MacroCommand {
  override aliases = ['@send', '@s'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [targetName, x, y, map] = args.arrayArgs;
    if (!targetName || !x || !y) {
      this.sendMessage(player, 'Syntax: Player X Y [Map]');
      return;
    }

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      targetName,
    );
    if (!target) return this.youDontSeeThatPerson(player, targetName);

    if (!isPlayer(player)) {
      return this.sendMessage(player, 'That is not a player.');
    }

    this.sendMessage(target, 'Woosh.');
    this.game.teleportHelper.teleport(target as Player, { x: +x, y: +y, map });

    this.game.playerHelper.refreshPlayerMapState(target as Player);
    this.game.playerManager.saveAllPlayers();
  }
}
