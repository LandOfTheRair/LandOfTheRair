import { GameServerEvent } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../helpers';
import { ServerAction } from '../../models/ServerAction';

export class ChangeEventWatcherAction extends ServerAction {
  override type = GameServerEvent.ChangeEventWatcher;
  override requiredKeys = ['eventWatcher'];
  override requiresLoggedIn = true;

  override async act(game: Game, callbacks, data) {
    try {
      await game.accountDB.changeEventWatcher(data.account, data.eventWatcher);
      await game.discordHelper.updateDiscordRoles(data.account);
      game.logger.log(
        'Auth:ChangeEventWatcher',
        `${data.username} changed event watcher.`,
      );
    } catch (e) {
      game.logger.error('ChangeEventWatcher', e as Error);
      return {
        message:
          'Could not change event watcher status? Try again, or contact a GM if this persists.',
      };
    }

    return {
      wasSuccess: true,
      message: 'Successfully changed your event watcher status.',
    };
  }
}
