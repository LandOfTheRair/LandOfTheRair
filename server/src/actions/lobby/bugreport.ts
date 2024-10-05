import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class BugReportAction extends ServerAction {
  override type = GameServerEvent.BugReport;
  override requiredKeys = ['report', 'userAgent'];

  override async act(game: Game, { broadcast, emit }, data) {
    if (!game.lobbyManager.hasJoinedGame(data.username)) return { message: '' };

    const player = game.playerManager.getPlayerInGame(data.account);

    if (!player) {
      return { message: '' };
    }

    if (!game.discordHelper.canSendBugReports) {
      return { message: 'Server not configured to handle bug reports.' };
    }

    data.report = game.profanityHelper.cleanMessage(data.report);
    data.userAgent = game.profanityHelper.cleanMessage(data.userAgent);

    game.discordHelper.sendBugReport(player, data);

    return {
      message: `Your bug was sent to #bugs on Discord. Follow ups will be there!`,
    };
  }
}
