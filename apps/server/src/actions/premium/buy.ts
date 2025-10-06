import { GameServerEvent } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../helpers';
import { ServerAction } from '../../models';

export class BuyPremiumAction extends ServerAction {
  override type = GameServerEvent.PremiumBuy;
  override requiredKeys = ['token', 'item'];

  override async act(game: Game, { emit }, data) {
    game.logger.log(
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
