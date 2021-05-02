import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class QuitAction extends ServerAction {
  override type = GameServerEvent.QuitGame;
  override requiredKeys = [];

  override async act(game: Game, { broadcast, emit }, data) {

    if (!game.lobbyManager.hasJoinedGame(data.username)) return { message: '' };

    const player = game.playerManager.getPlayerInGame(data.account);

    game.lobbyManager.leaveGame(data.username);

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
