import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ChangeEventWatcherAction extends ServerAction {
  type = GameServerEvent.ChangeEventWatcher;
  requiredKeys = ['eventWatcher'];
  requiresLoggedIn = true;

  async act(game: Game, callbacks, data) {
    try {
      await game.accountDB.changeEventWatcher(data.account, data.eventWatcher);
      await game.discordHelper.updateDiscordRoles(data.account);
      game.logger.log('Auth:ChangeEventWatcher', `${data.username} changed event watcher.`);

    } catch (e) {
      game.logger.error('ChangeEventWatcher', e);
      return { message: 'Could not change event watcher status? Try again, or contact a GM if this persists.' };
    }

    return {
      wasSuccess: true,
      message: 'Successfully changed your event watcher status.'
    };
  }
}
