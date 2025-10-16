import type { IServerGame } from '@lotr/interfaces';
import { GameServerEvent } from '@lotr/interfaces';

import { consoleLog } from '@lotr/logger';
import { ServerAction } from '../../models';

export class RedeemCodeAction extends ServerAction {
  override type = GameServerEvent.CodeRedeem;
  override requiredKeys = ['code'];

  override async act(game: IServerGame, { emit }, data) {
    consoleLog('Code:Redeem', `${data.username} redeeming ${data.code}.`);

    try {
      await game.redeemableDB.claimRedeemable(data.code, data.username);
    } catch (e) {
      return { message: (e as Error).message, wasSuccess: false };
    }

    return {
      wasSuccess: true,
      message: `You redeemed the code! Head to the Steelrose Market to claim your reward!`,
    };
  }
}
