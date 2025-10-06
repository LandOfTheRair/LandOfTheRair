import type { IMacroCommandArgs } from '@lotr/interfaces';
import { SoundEffect } from '@lotr/interfaces';
import type { Player } from '../../../../../models';
import { MacroCommand } from '../../../../../models/macro';

export class Stairs extends MacroCommand {
  override aliases = ['up', 'down'];
  override canBeFast = true;

  override execute(player: Player, args: IMacroCommandArgs) {
    if (this.game.effectHelper.hasEffect(player, 'Snare')) {
      return this.sendMessage(player, 'You are snared!');
    }

    const map = this.game.worldManager.getMap(player.map)?.map;
    if (!map) return;

    const interactable = map.getInteractableAt(player.x, player.y);

    if (
      !interactable ||
      !['StairsUp', 'StairsDown'].includes(interactable.type)
    ) {
      this.sendMessage(player, 'There are no stairs here.');
      return;
    }

    if (
      !this.game.movementHelper.canUseTeleportInteractable(player, interactable)
    ) {
      return;
    }

    this.sendMessage(
      player,
      `You ${interactable.type === 'StairsUp' ? 'ascend' : 'descend'} the staircase.`,
      SoundEffect.EnvStairs,
    );

    const teleportDestination =
      this.game.movementHelper.getDestinationForTeleportInteractable(
        player,
        interactable,
      );
    if (!teleportDestination) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message:
          'It seems this portal is active, but the connection is severed.',
      });
      return;
    }

    this.game.teleportHelper.teleport(player, {
      x: teleportDestination.x,
      y: teleportDestination.y,
      map: teleportDestination.map,
    });

    this.game.movementHelper.postTeleportInteractableActions(
      player,
      interactable,
    );
  }
}
