import { merge } from 'lodash';

import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { Player, WorldMap } from '../../models';
import { ServerAction } from '../../models/ServerAction';

export class PlayAction extends ServerAction {
  override type = GameServerEvent.PlayCharacter;
  override requiredKeys = ['charSlot'];

  override async act(game: Game, { broadcast, emit }, data) {
    if (data.account.isBanned) {
      emit(
        game.messageHelper.getSystemMessageObject(
          'You are not able to enter the game at this time. Contact a GM or email help@rair.land if you believe this is in error.',
        ),
      );

      return {};
    }

    if (game.lobbyManager.isBlocked()) {
      emit(
        game.messageHelper
          .getSystemMessageObject(`The game is currently updating, so play is disabled for a few minutes.
        If this persists for too long, contact a GM or email help@rair.land.`),
      );

      return {};
    }

    if (game.lobbyManager.hasJoinedGame(data.username)) {
      return { message: 'Already in game.' };
    }

    const charSlot = data.charSlot;

    let player!: Player;
    for (const checkPlayer of data.account.players) {
      if (checkPlayer?.charSlot !== charSlot) continue;
      player = checkPlayer;
    }

    if (!player) return { message: `No character in slot ${charSlot}.` };

    const autoApplyUserData = game.testHelper.autoApplyUserData;
    merge(player, autoApplyUserData);

    const mapName = player.map;

    let map: WorldMap | undefined = game.worldManager.getMap(mapName)?.map;
    if (!map || !player.x || !player.y || isNaN(player.x) || isNaN(player.y)) {
      map = game.worldManager.getMap('Tutorial')?.map;

      player.map = 'Tutorial';
      player.x = 14;
      player.y = 14;
    }

    // if they're out of bounds, drop them on the respawn point
    if (
      map &&
      (player.x > map.width - 4 ||
        player.y > map.height - 4 ||
        player.x <= 4 ||
        player.y <= 4)
    ) {
      player.x = map.respawnPoint.x;
      player.y = map.respawnPoint.y;
    }

    if (map && map.properties.respawnKick && map.properties.kickMap) {
      const respawnMap = map.properties.kickMap;
      const respawnX = map.properties.kickX ?? 0;
      const respawnY = map.properties.kickY ?? 0;

      map = game.worldManager.getMap(respawnMap)?.map;

      player.map = respawnMap;
      player.x = respawnX;
      player.y = respawnY;
    }

    await game.lobbyManager.joinGame(data.account, player);

    emit({
      action: GameAction.GamePlay,
    });

    emit({
      action: GameAction.GameSetPlayer,
      player: game.db.prepareForTransmission(player),
    });

    emit({
      action: GameAction.GameSetMap,
      map: map!.mapData,
    });

    broadcast({
      action: GameAction.ChatUserEnterGame,
      username: data.username,
    });

    game.playerHelper.refreshPlayerMapState(player);

    return {};
  }
}
