import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class QuitAction extends ServerAction {
  type = GameServerEvent.QuitGame;
  requiredKeys = [];

  async act(game: Game, { broadcast, emit }, data) {

    if (!game.lobbyManager.isAccountInGame(data.account)) return { message: '' };

    const player = game.playerManager.getPlayerInGame(data.account);

    game.lobbyManager.accountLeaveGame(data.account);

    if (player) {
      emit({
        action: GameAction.SetCharacterSlotInformation,
        slot: player.charSlot,
        characterInfo: game.db.prepareForTransmission(player)
      });
    }

    broadcast({
      action: GameAction.ChatUserLeaveGame,
      username: data.username
    });

    emit({
      action: GameAction.GameQuit
    });

    return {};
  }
}
