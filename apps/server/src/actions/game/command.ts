import { GameServerEvent } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../helpers';
import { ServerAction } from '../../models';

export class CommandAction extends ServerAction {
  override type = GameServerEvent.DoCommand;
  override requiredKeys = ['command'];

  override async act(game: Game, callbacks, data) {
    if (!game.lobbyManager.hasJoinedGame(data.username)) return { message: '' };

    const player = game.playerManager.getPlayerInGame(data.account);
    if (!player) return { message: 'Player ref is not available.' };

    game.commandHandler.doCommand(player, data, callbacks);

    return {};
  }
}
