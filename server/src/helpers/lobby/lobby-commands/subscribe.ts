import { ILobbyCommand, SubscriptionTier } from '../../../interfaces';

import { Game } from '../../core';

export class SubscribeCommand implements ILobbyCommand {
  name = '/subscribe';
  syntax = '/subscribe <days> <accountname> (account must be online)';

  async do(message: string, game: Game, emit: (args) => void) {
    const [cmd, days, rest] = message.split(' ');

    if (!rest) return false;

    const account = game.lobbyManager.getAccount(rest);
    if (!account) return false;

    game.subscriptionHelper.startTrial(account, +days, SubscriptionTier.Trial);

    emit(
      game.messageHelper.getSystemMessageObject(
        `${account.username} was given a ${days}-day subscription.`,
      ),
    );

    return true;
  }
}
