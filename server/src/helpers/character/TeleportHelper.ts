
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

    const { state } = this.game.worldManager.getMap(player.map);
    state.moveNPCOrPlayer(player, oldPos);

    this.game.visibilityHelper.calculatePlayerFOV(player);
  }

  // teleport a player to their respawn point
  public teleportToRespawnPoint(player: Player): void {
    this.teleport(player, { x: player.respawnPoint.x, y: player.respawnPoint.y, map: player.respawnPoint.map });
  }

  // teleport a player somewhere
  public teleport(
    player: Player,
    { x, y, map, zChange = 0, zSet = 0, fromLeaveMap = false }:
      { x: number, y: number, map?: string, zChange?: number, zSet?: number, fromLeaveMap?: boolean }
  ) {

    // if we're not changing maps, move on this one
    if (!map || player.map === map) {
      this.setCharXY(player, x, y);
      this.game.playerHelper.resetStatus(player, { sendFOV: false });
      this.game.transmissionHelper.sendMovementPatch(player);
    }

    // adjust your Z level for up/down nav
    if (zChange) {
      player.z += zChange;
    }

    if (zSet) {
      player.z = zSet;
    }

    // check if the new map even exists before going
    if (map && player.map !== map) {

      const { state: newState, map: newMap } = this.worldManager.getMap(map);
      if (!newState) {
        this.game.messageHelper.sendLogMessageToPlayer(player, { message: `Warning: map ${map} does not exist.` });
        return;
      }

      // TODO: players coming in from different teleports will have different z coords. figure this out.
      player.z = 0;

      if (!player.isBeingForciblyRespawned) {
        this.game.worldManager.leaveMap(player);
      }

      // order of operations here is REALLY important

      // first we update the map, then join the map
      player.map = map;
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
