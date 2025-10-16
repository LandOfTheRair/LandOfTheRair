import type { ILobbyCommand } from '../../../interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IServerGame } from '@lotr/interfaces';

export class KickCommand implements ILobbyCommand {
  name = '/kick';
  syntax = '/kick <accountname> (account must be online)';

  async do(message: string, game: IServerGame, emit: (args) => void) {
    const [cmd, rest] = message.split(' ');

    if (!rest) return false;

    if (!game.lobbyManager.hasJoinedGame(rest)) return false;

    game.lobbyManager.forceLeaveGame(rest);

    emit(
      game.messageHelper.getSystemMessageObject(
        `${rest} was kicked from game.`,
      ),
    );

    return true;
  }
}
