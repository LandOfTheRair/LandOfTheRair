import type { IServerAction, IServerGame } from '@lotr/interfaces';
import { GameServerEvent, GameServerResponse } from '@lotr/interfaces';

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
    game: IServerGame,
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
