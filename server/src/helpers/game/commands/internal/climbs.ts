import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class Climbs extends MacroCommand {

  aliases = ['climbup', 'climbdown'];
  canBeFast = true;

  execute(player: Player, args: IMacroCommandArgs) {

    // TODO: Snare

    const { map } = this.game.worldManager.getMap(player.map);
    const interactable = map.getInteractableAt(player.x, player.y);

    if (!interactable || !['ClimbUp', 'ClimbDown'].includes(interactable.type)) {
      this.sendMessage(player, 'There is nowhere to grip here.');
      return;
    }

    const { teleportMap, teleportX, teleportY, requireParty, subscriberOnly, requireHoliday } = interactable.properties;

    if (subscriberOnly && !this.game.subscriptionHelper.isPlayerSubscribed(player))  return this.sendMessage(player, 'You found an easter egg! Sadly, it\'s spoiled.');
    if (requireParty && !player.partyName)                                           return this.sendMessage(player, 'You must gather your party before venturing forth.');
    if (requireHoliday && !this.game.holidayHelper.isHoliday(requireHoliday))        return this.sendMessage(player, `That location is only seasonally open during "${requireHoliday}"!`);

    this.sendMessage(player, `You climb ${interactable.type === 'ClimbUp' ? 'up' : 'down'}.`, 'env-stairs');

    this.game.teleportHelper.teleport(
      player,
      { x: teleportX, y: teleportY, map: teleportMap, zChange: interactable.type === 'ClimbUp' ? 1 : -1 }
    );

  }

}
