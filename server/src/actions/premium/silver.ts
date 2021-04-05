import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models';

export class BuyPremiumWithSilverAction extends ServerAction {
  override type = GameServerEvent.PremiumSilverBuy;
  override requiredKeys = ['item'];

  override async act(game: Game, { emit }, data) {

    if (game.lobbyManager.isAccountInGame(data.account)) {
      return { wasSuccess: false, message: 'You cannot buy silver perks while in game.' };
    }

    if (!game.subscriptionHelper.canBuySilverItem(data.account, data.item)) {
      return { wasSuccess: false, message: 'You cannot buy that perk.' };
    }

    game.logger.log('Premium:BuyWithSilver', `${data.username} buying ${data.item}.`);

    game.subscriptionHelper.buySilverItem(data.account, data.item);

    return {};
  }

}
