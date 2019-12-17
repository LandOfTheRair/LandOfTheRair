import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models';

export class CommandAction extends ServerAction {
  type = GameServerEvent.DoCommand;
  requiredKeys = ['command'];

  async act(game: Game, { emit }, data) {
    if (!game.lobbyManager.isAccountInGame(data.account)) throw new Error('Not in game.');

    const player = game.playerManager.getPlayerInGame(data.account);
    if (!player) throw new Error('Player ref is not available.');

    game.commandHandler.doCommand(player, data);
  }
}
