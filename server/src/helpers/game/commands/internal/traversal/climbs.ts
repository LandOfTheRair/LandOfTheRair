import { IMacroCommandArgs, SoundEffect } from '../../../../../interfaces';
import { Player } from '../../../../../models';
import { MacroCommand } from '../../../../../models/macro';

export class Climbs extends MacroCommand {
  override aliases = ['climbup', 'climbdown'];
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
      !['ClimbUp', 'ClimbDown'].includes(interactable.type)
    ) {
      this.sendMessage(player, 'There is nowhere to grip here.');
      return;
    }

    if (
      !this.game.movementHelper.canUseTeleportInteractable(player, interactable)
    ) {
      return;
    }

    const teleportDestination =
      this.game.movementHelper.getDestinationForTeleportInteractable(
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

    this.sendMessage(
      player,
      `You climb ${interactable.type === 'ClimbUp' ? 'up' : 'down'}.`,
      SoundEffect.EnvStairs,
    );

    this.game.movementHelper.postTeleportInteractableActions(
      player,
      interactable,
    );
  }
}
