import { GameServerEvent } from '@lotr/interfaces';

import { consoleLog } from '@lotr/logger';
import type { Game } from '../../helpers';
import { ServerAction } from '../../models';

export class BuyPremiumWithSilverAction extends ServerAction {
  override type = GameServerEvent.PremiumSilverBuy;
  override requiredKeys = ['item'];

  // eslint-disable-next-line no-empty-pattern
  override async act(game: Game, {}, data) {
    if (game.lobbyManager.hasJoinedGame(data.username)) {
      return {
        wasSuccess: false,
        message: 'You cannot buy silver perks while in game.',
      };
    }

    if (!game.subscriptionHelper.canBuySilverItem(data.account, data.item)) {
      return { wasSuccess: false, message: 'You cannot buy that perk.' };
    }

    consoleLog(
      'Premium:BuyWithSilver',
      `${data.username} buying ${data.item}.`,
    );

    game.subscriptionHelper.buySilverItem(data.account, data.item);

    return {};
  }
}
