
import { Injectable } from 'injection-js';

import { BaseService } from '../../interfaces';
import { Player } from '../../models';

@Injectable()
export class TeleportHelper extends BaseService {

  public init() {}

  public setCharXY(player: Player, x: number, y: number) {

    const oldPos = { oldX: player.x, oldY: player.y };

    player.x = x;
    player.y = y;

    const { state } = this.game.worldManager.getMap(player.map);
    state.moveNPCOrPlayer(player, oldPos);

    this.game.visibilityHelper.calculatePlayerFOV(player);
  }

  public teleport(
    player: Player,
    { x, y, map, zChange = 0, zSet = 0 }: { x: number, y: number, map?: string, zChange?: number, zSet?: number }
  ) {

    // if we're not changing maps, move on this one
    if (!map || player.map === map) {
      this.setCharXY(player, x, y);
    }

    // adjust your Z level for up/down nav
    if (zChange) {
      player.z += zChange;
    }

    if (zSet) {
      player.z = zSet;
    }

    this.game.playerHelper.resetStatus(player);

    // check if the new map even exists before going
    if (map && player.map !== map) {
      const mapData = this.game.worldManager.getMap(map);
      if (!mapData) {
        this.game.messageHelper.sendLogMessageToPlayer(player, { message: `Warning: map ${map} does not exist.` });
        return;
      }

      // TODO: players coming in from different teleports will have different z coords. figure this out.
      player.z = 0;
      // TODO: teleport to new map
    }
  }

}
