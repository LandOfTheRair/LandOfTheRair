import type { IServerAction } from '@lotr/interfaces';
import { GameServerEvent, GameServerResponse } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../helpers';

export class ServerAction implements IServerAction {
  type = GameServerEvent.Default;
  requiresLoggedIn = true;
  canBeUnattended = false;
  requiredKeys: string[] = [];

  validate(args) {
    if (!this.requiredKeys || !this.requiredKeys.length) return true;

    return this.requiredKeys.every((key) => typeof args[key] !== 'undefined');
  }

  async act(
    game: Game,
    callbacks,
    data,
  ): Promise<{ wasSuccess?: boolean; message?: string }> {
    callbacks?.emit?.({
      type: GameServerResponse.Error,
      error: 'No type specified.',
      data,
    });
    return { wasSuccess: false, message: 'No type specified' };
  }
}
