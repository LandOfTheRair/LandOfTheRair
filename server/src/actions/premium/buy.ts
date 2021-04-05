import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models';

export class BuyPremiumAction extends ServerAction {
  override type = GameServerEvent.PremiumBuy;
  override requiredKeys = ['token', 'item'];

  override async act(game: Game, { emit }, data) {

    game.logger.log('Premium:Buy', `${data.username} buying ${data.item.key} (${data.token.id}).`);

    game.subscriptionHelper.buyWithIRLMoney(data.account, data.token, data.item);

    return {};
  }

}
