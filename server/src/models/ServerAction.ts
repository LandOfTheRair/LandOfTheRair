import { Game } from '../helpers';
import { GameServerEvent, GameServerResponse, IServerAction, IServerResponse } from '../interfaces';

export class ServerAction implements IServerAction {
  type = GameServerEvent.Default;
  requiredKeys = [];

  validate(args) {
    if (!this.requiredKeys || !this.requiredKeys.length) return true;

    return this.requiredKeys.every(key => args[key]);
  }

  async act(game: Game, data): Promise<IServerResponse> {
    return { type: GameServerResponse.Error, error: 'No type specified.', data };
  }
}
