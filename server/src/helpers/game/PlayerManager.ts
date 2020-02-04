import { Injectable } from 'injection-js';

import { BaseService, GameAction } from '../../interfaces';
import { Account, Player } from '../../models';
import { CharacterHelper, PlayerHelper } from '../character';


@Injectable()
export class PlayerManager extends BaseService {

  private currentSlowTick = 0;
  private readonly SAVE_TICK_COUNT = 150;

  constructor(
    private characterHelper: CharacterHelper,
    private playerHelper: PlayerHelper
  ) {
    super();
  }

  private inGamePlayers: { [account: string]: Player } = {};

  public init() {}

  public getPlayerInGame(account: Account): Player {
    return this.inGamePlayers[account.username];
  }

  public async addPlayerToGame(player: Player) {
    const username = player.username;
    this.inGamePlayers[username] = player;
    this.updatePlayerData(player);
    this.game.transmissionHelper.startWatching(player);

    const sendPlayer = await this.game.transmissionHelper.convertPlayerForTransmission(player);
    this.game.transmissionHelper.sendActionToAccount(username, GameAction.GameSetPlayer, { player: sendPlayer });
  }

  public async removePlayerFromGame(player: Player) {
    const username = player.username;
    delete this.inGamePlayers[username];
    this.game.transmissionHelper.stopWatching(player);

    this.game.transmissionHelper.sendActionToAccount(username, GameAction.GameSetPlayer, { player: null });
  }

  public async removePlayerFromGameByAccount(account: Account) {
    delete this.inGamePlayers[account.username];

    this.game.transmissionHelper.sendActionToAccount(account.username, GameAction.GameSetPlayer, { player: null });
  }

  // TODO: how to patch player object client side? (map state: update)

  public updatePlayerData(player: Player) {
    this.characterHelper.calculateStatTotals(player);
  }

  private tick(type: 'slow'|'fast') {
    Object.values(this.inGamePlayers).forEach(player => {
      this.playerHelper.tick(player, type);
    });
  }

  public savePlayer(player: Player) {
    this.game.characterDB.savePlayer(player);
  }

  public saveAllPlayers() {
    Object.values(this.inGamePlayers).forEach(player => this.savePlayer(player));
  }

  public fastTick() {
    this.tick('fast');
  }

  public slowTick() {
    this.tick('slow');

    this.currentSlowTick++;
    if (this.currentSlowTick > this.SAVE_TICK_COUNT) {
      this.saveAllPlayers();
    }
  }

}
