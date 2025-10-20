import type { IServerGame } from '@lotr/interfaces';
import { GameServerEvent } from '@lotr/interfaces';

import { consoleError, consoleLog } from '@lotr/logger';
import { ServerAction } from '../../models/ServerAction';

export class ChangeAlwaysOnlineAction extends ServerAction {
  override type = GameServerEvent.ChangeAlwaysOnline;
  override requiredKeys = ['alwaysOnline'];
  override requiresLoggedIn = true;

  override async act(game: IServerGame, callbacks, data) {
    try {
      await game.accountDB.changeAlwaysOnline(data.account, data.alwaysOnline);
      await game.discordHelper.updateDiscordRoles(data.account);
      consoleLog(
        'Auth:ChangeAlwaysOnline',
        `${data.username} changed always online.`,
      );
    } catch (e) {
      consoleError('ChangeAlwaysOnline', e as Error);
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
