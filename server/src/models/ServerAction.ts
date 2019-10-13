import { Game } from '../helpers';
import { GameServerEvent, GameServerResponse, IServerAction } from '../interfaces';

export class ServerAction implements IServerAction {
  type = GameServerEvent.Default;
  requiredKeys: string[] = [];

  validate(args) {
    if (!this.requiredKeys || !this.requiredKeys.length) return true;

    return this.requiredKeys.every(key => typeof args[key] !== 'undefined');
  }

  async act(game: Game, { broadcast, emit }, data): Promise<void> {
    emit({ type: GameServerResponse.Error, error: 'No type specified.', data });
  }
}
