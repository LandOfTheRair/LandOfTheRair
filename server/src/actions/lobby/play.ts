import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { Player, WorldMap } from '../../models';
import { ServerAction } from '../../models/ServerAction';

export class PlayAction extends ServerAction {
  override type = GameServerEvent.PlayCharacter;
  override requiredKeys = ['charSlot'];

  override async act(game: Game, { broadcast, emit }, data) {
    if (data.account.isBanned) {
      emit({
        action: GameAction.ChatAddMessage,
        timestamp: Date.now(),
        message: 'You are not able to enter the game at this time. Contact a GM or email help@rair.land if you believe this is in error.',
        from: '★System'
      });

      return {};
    }

    if (game.lobbyManager.isBlocked()) {
      emit({
        action: GameAction.ChatAddMessage,
        timestamp: Date.now(),
        message: `The game is currently updating, so play is disabled for a few minutes.
        If this persists for too long, contact a GM or email help@rair.land.`,
        from: '★System'
      });

      return {};
    }

    if (game.lobbyManager.isAccountInGame(data.account))  return { message: 'Already in game.' };

    const charSlot = data.charSlot;

    let player!: Player;
    for (const checkPlayer of data.account.players) {
      if (checkPlayer?.charSlot !== charSlot) continue;
      player = checkPlayer;
    }

    if (!player)                                          return { message: `No character in slot ${charSlot}.` };
    const mapName = player.map;

    let map: WorldMap = game.worldManager.getMap(mapName).map;
    if (!map || !player.x || !player.y || isNaN(player.x) || isNaN(player.y)) {
      map = game.worldManager.getMap('Tutorial').map;

      player.map = 'Tutorial';
      player.x = 14;
      player.y = 14;
    }

    await game.lobbyManager.accountEnterGame(data.account, player);

    emit({
      action: GameAction.GamePlay
    });

    emit({
      action: GameAction.GameSetPlayer,
      player: game.db.prepareForTransmission(player)
    });

    emit({
      action: GameAction.GameSetMap,
      map: map.mapData
    });

    broadcast({
      action: GameAction.ChatUserEnterGame,
      username: data.username
    });

    game.worldManager.getMapStateForCharacter(player).triggerFullUpdateForPlayer(player);

    return {};
  }
}
