
import { Injectable } from 'injection-js';

import { GameAction } from '../../interfaces';
import { Player } from '../../models';
import { BaseService } from '../../models/BaseService';
import { WorldManager } from '../data/WorldManager';

@Injectable()
export class TeleportHelper extends BaseService {

  constructor(private worldManager: WorldManager) {
    super();
  }

  public init() {}

  public setCharXY(player: Player, x: number, y: number) {

    const oldPos = { oldX: player.x, oldY: player.y };

    player.x = x;
    player.y = y;

    const { map, state } = this.game.worldManager.getMap(player.map);

    if (player.x > map.width - 4 || player.x < 4 || player.y > map.height - 4 || player.y < 4) {
      player.x = map.respawnPoint.x;
      player.y = map.respawnPoint.y;
      this.game.messageHelper.sendSimpleMessage(player, `This teleport has gone out of bounds to ${x}, ${y} - please report this to a GM.`);
    }

    state.moveNPCOrPlayer(player, oldPos);

    this.game.visibilityHelper.calculatePlayerFOV(player);
  }

  // teleport a player to their respawn point
  public teleportToRespawnPoint(player: Player): void {
    this.teleport(player, { x: player.respawnPoint.x, y: player.respawnPoint.y, map: player.respawnPoint.map });
  }

  // whether or not you can enter a map - instanced maps require you to be in a party
  public canTeleport(player: Player, map: string): boolean {
    if (this.game.worldManager.isDungeon(map)) return this.game.partyHelper.isInParty(player);
    return true;
  }

  // teleport a player somewhere
  public teleport(
    player: Player,
    { x, y, map }:
    { x: number; y: number; map?: string }
  ) {

    // if we're not changing maps, move on this one
    if (!map || player.map === map) {
      this.setCharXY(player, x, y);
      this.game.playerHelper.resetStatus(player, { sendFOV: false });
      this.game.transmissionHelper.sendMovementPatch(player);
    }

    // check if the new map even exists before going
    if (map && player.map !== map) {

      // get the real destination name (in case of dungeon) and ensure it exists before traveling there
      const destinationMapName = this.worldManager.getDestinationMapName(player, map);
      this.game.worldManager.ensureMapExists(map, this.game.partyHelper.partyName(player), destinationMapName);

      const { state: newState, map: newMap } = this.worldManager.getMap(destinationMapName);
      if (!newState) {
        this.game.messageHelper.sendLogMessageToPlayer(player, { message: `Warning: map ${map} does not exist.` });
        return;
      }

      if (!player.isBeingForciblyRespawned) {
        this.game.worldManager.leaveMap(player);
      }

      // order of operations here is REALLY important

      // first we update the map, then join the map
      player.map = destinationMapName;
      this.game.worldManager.joinMap(player);

      // then we send a blank FOV patch to the player so they don't see a random spot on the map
      this.game.transmissionHelper.sendMovementPatch(player, true);

      // then we update their x/y to the new x/y
      player.x = x;
      player.y = y;

      // then we send them the new map
      this.game.transmissionHelper.sendActionToPlayer(player, GameAction.GameSetMap, { map: newMap.mapData });

      // then we update their status based on the new map, and send them the new movement patch with their real FOV
      this.game.playerHelper.resetStatus(player, { sendFOV: false });
      this.game.transmissionHelper.sendMovementPatch(player);
    }
  }

}
