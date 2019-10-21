import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { WorldMap } from '../../models';
import { ServerAction } from '../../models/ServerAction';

export class PlayAction extends ServerAction {
  type = GameServerEvent.PlayCharacter;
  requiredKeys = ['charSlot'];

  async act(game: Game, { broadcast, emit }, data) {
    if (game.lobbyManager.isAccountInGame(data.account)) throw new Error('Already in game.');

    const charSlot = data.charSlot;
    const player = data.account.players[charSlot];

    if (!player) throw new Error(`No character in slot ${charSlot}.`);
    const mapName = player.map;

    let map: WorldMap = game.worldManager.getMap(mapName);
    if (!map) {
      map = game.worldManager.getMap('Tutorial');

      // TODO: how do I send this update to the client
      player.x = 14;
      player.y = 14;
    }

    game.lobbyManager.accountEnterGame(data.account);

    broadcast({
      action: GameAction.ChatUserEnterGame,
      username: data.username
    });

    emit({
      action: GameAction.GamePlay
    });

    emit({
      action: GameAction.GameSetMap,
      map: map.mapData
    });
  }
}
