import { GameAction, GameServerEvent } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../helpers';
import { ServerAction } from '../../models/ServerAction';

export class QuitAction extends ServerAction {
  override type = GameServerEvent.QuitGame;
  override requiredKeys = [];

  override async act(game: Game, { broadcast, emit }, data) {
    if (!game.lobbyManager.hasJoinedGame(data.username)) return { message: '' };

    const player = game.playerManager.getPlayerInGame(data.account);

    game.lobbyManager.leaveGame(data.username);

    if (player) {
      game.statisticsHelper.syncSessionStatistics(player);

      emit({
        action: GameAction.SetCharacterSlotInformation,
        slot: player.charSlot,
        characterInfo: game.db.prepareForTransmission(player),
      });

      emit({
        action: GameAction.SetSessionStatistics,
        statistics: player.sessionStatistics,
      });
    }

    broadcast({
      action: GameAction.ChatUserLeaveGame,
      username: data.username,
    });

    emit({
      action: GameAction.GameQuit,
    });

    return {};
  }
}
