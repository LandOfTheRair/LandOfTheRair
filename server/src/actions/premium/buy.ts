import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models';

export class BuyPremiumAction extends ServerAction {
  type = GameServerEvent.PremiumBuy;
  requiredKeys = ['token', 'item'];

  async act(game: Game, { emit }, data) {

    game.logger.log('Premium:Buy', `${data.username} buying ${data.item.key} (${data.token.id}).`);

    game.subscriptionHelper.buyWithIRLMoney(data.account, data.token, data.item);

    return {};
  }

}
