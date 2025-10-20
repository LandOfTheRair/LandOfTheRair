import { MacroCommand, worldGetMapAndState } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { isUndefined } from 'lodash';
import type { Player } from '../../../../models';

export class GMTeleportTo extends MacroCommand {
  override aliases = ['@teleportto', '@tt'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [search, index] = args.arrayArgs;

    const allPossibleTargets: ICharacter[] = [];

    this.game.worldManager.allMapNames.forEach((map) => {
      const mapData = worldGetMapAndState(map);
      if (!mapData.state) return;

      const validNPCs = mapData.state.allNPCS.filter((npc) =>
        this.game.targettingHelper.doesTargetMatchSearch(npc, search, true),
      );

      allPossibleTargets.push(...validNPCs);
    });

    const allPlayers = this.game.playerManager.getAllPlayers();
    const matchingPlayers = allPlayers.filter((p) =>
      this.game.targettingHelper.doesTargetMatchSearch(p, search, true),
    );
    allPossibleTargets.push(...matchingPlayers);

    const targetIndex = isUndefined(index) ? 0 : +index;
    const target = allPossibleTargets[targetIndex];

    if (!target) {
      return this.sendChatMessage(player, 'There was no matching target.');
    }

    this.sendMessage(
      player,
      `There are ${allPossibleTargets.length} targets that match "${search}" - taking you to #${targetIndex}.`,
    );
    this.sendMessage(player, 'Woosh.');

    this.game.teleportHelper.teleport(player as Player, {
      x: target.x,
      y: target.y,
      map: target.map,
    });

    this.game.playerManager.saveAllPlayers();
  }
}
