import type { IServerGame } from '@lotr/interfaces';
import { GameServerEvent } from '@lotr/interfaces';

import { consoleLog } from '@lotr/logger';
import { ServerAction } from '../../models';

export class BuyPremiumAction extends ServerAction {
  override type = GameServerEvent.PremiumBuy;
  override requiredKeys = ['token', 'item'];

  override async act(game: IServerGame, { emit }, data) {
    consoleLog(
      'Premium:Buy',
      `${data.username} buying ${data.item.key} (${data.token.id}).`,
    );

    try {
      await game.subscriptionHelper.buyWithIRLMoney(
        data.account,
        data.token,
        data.item,
      );
    } catch (e) {
      return { message: (e as Error).message, wasSuccess: false };
    }

    return {};
  }
}
