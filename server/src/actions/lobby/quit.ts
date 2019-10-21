import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class QuitAction extends ServerAction {
  type = GameServerEvent.QuitGame;
  requiredKeys = [];

  async act(game: Game, { broadcast, emit }, data) {

    if (!game.lobbyManager.isAccountInGame(data.account)) throw new Error('Not in game.');

    game.lobbyManager.accountLeaveGame(data.account);

    broadcast({
      action: GameAction.ChatUserLeaveGame,
      username: data.username
    });

    emit({
      action: GameAction.GameQuit
    });
  }
}
