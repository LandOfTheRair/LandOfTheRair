import { Singleton } from 'typescript-ioc';

import { BaseService, GameAction } from '../../interfaces';
import { Account, Player } from '../../models';

@Singleton
export class PlayerManager extends BaseService {

  private inGamePlayers: { [account: string]: Player } = {};

  public init() {}

  public async addPlayerToGame(player: Player) {
    const username = await player.account.get('username');
    this.inGamePlayers[username] = player;

    this.game.sendActionToAccount(username, GameAction.GameSetPlayer, { player });
  }

  public async removePlayerFromGame(player: Player) {
    const username = await player.account.get('username');
    delete this.inGamePlayers[username];

    this.game.sendActionToAccount(username, GameAction.GameSetPlayer, { player: null });
  }

  public async removePlayerFromGameByAccount(account: Account) {
    delete this.inGamePlayers[account.username];

    this.game.sendActionToAccount(account.username, GameAction.GameSetPlayer, { player: null });
  }

}
