import { wrap } from 'mikro-orm';
import { Inject, Singleton } from 'typescript-ioc';
import { BaseService, GameAction, Stat } from '../../interfaces';
import { Account, Player } from '../../models';
import { PlayerHelper } from '../character';


@Singleton
export class PlayerManager extends BaseService {

  @Inject private playerHelper: PlayerHelper;

  private inGamePlayers: { [account: string]: Player } = {};

  public init() {}

  public getPlayerInGame(account: Account): Player {
    return this.inGamePlayers[account.username];
  }

  public async addPlayerToGame(player: Player) {
    const username = await player.account.get('username');
    this.inGamePlayers[username] = player;

    // if we don't do this, it eats random properties when it does JSON.stringify(). dunno how, but whatever.
    const sendPlayer = await wrap(player).toObject();
    this.game.sendActionToAccount(username, GameAction.GameSetPlayer, { player: sendPlayer });
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

  private tick(type: 'slow'|'fast') {
    Object.values(this.inGamePlayers).forEach(player => {
      if (!player.actionQueue) return;

      const queue = player.actionQueue[type] || [];

      const actions = type === 'fast' ? 1 : (this.playerHelper.getStat(player, Stat.ActionSpeed) || 1);

      for (let i = 0; i < actions; i++) {
        const command = queue.shift();
        if (!command) continue;

        command();
      }
    });
  }

  public fastTick() {
    this.tick('fast');
  }

  public slowTick() {
    this.tick('slow');
  }

}
