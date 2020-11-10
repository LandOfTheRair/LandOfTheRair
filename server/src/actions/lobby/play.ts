import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { Player, WorldMap } from '../../models';
import { ServerAction } from '../../models/ServerAction';

export class PlayAction extends ServerAction {
  type = GameServerEvent.PlayCharacter;
  requiredKeys = ['charSlot'];

  async act(game: Game, { broadcast, emit }, data) {
    if (game.lobbyManager.isAccountInGame(data.account)) throw new Error('Already in game.');

    const charSlot = data.charSlot;

    let player!: Player;
    for (const checkPlayer of data.account.players) {
      if (checkPlayer.charSlot !== charSlot) continue;
      player = checkPlayer;
    }

    if (!player) throw new Error(`No character in slot ${charSlot}.`);
    const mapName = player.map;

    let map: WorldMap = game.worldManager.getMap(mapName).map;
    if (!map || !player.x || !player.y || isNaN(player.x) || isNaN(player.y)) {
      map = game.worldManager.getMap('Tutorial').map;

      player.map = 'Tutorial';
      player.x = 14;
      player.y = 14;
    }

    game.lobbyManager.accountEnterGame(data.account, player);

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
