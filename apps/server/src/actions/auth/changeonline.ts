import { GameServerEvent } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../helpers';
import { ServerAction } from '../../models/ServerAction';

export class ChangeAlwaysOnlineAction extends ServerAction {
  override type = GameServerEvent.ChangeAlwaysOnline;
  override requiredKeys = ['alwaysOnline'];
  override requiresLoggedIn = true;

  override async act(game: Game, callbacks, data) {
    try {
      await game.accountDB.changeAlwaysOnline(data.account, data.alwaysOnline);
      await game.discordHelper.updateDiscordRoles(data.account);
      game.logger.log(
        'Auth:ChangeAlwaysOnline',
        `${data.username} changed always online.`,
      );
    } catch (e) {
      game.logger.error('ChangeAlwaysOnline', e as Error);
      return {
        message:
          'Could not change online status? Try again, or contact a GM if this persists.',
      };
    }

    return {
      wasSuccess: true,
      message: 'Successfully changed your always online status.',
    };
  }
}
