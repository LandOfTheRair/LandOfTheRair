import { Injectable } from 'injection-js';

import { GameAction, IPlayer } from '../../interfaces';
import { Account, Player, PlayerState } from '../../models';
import { BaseService } from '../../models/BaseService';
import { CharacterHelper } from '../character/CharacterHelper';


@Injectable()
export class PlayerManager extends BaseService {

  private currentSlowTick = 0;
  private saveTicks = 150;

  constructor(
    private characterHelper: CharacterHelper
  ) {
    super();
  }

  private inGamePlayers: Record<string, Player> = {};
  private playerStates: Record<string, PlayerState> = {};

  public init() {
    this.saveTicks = this.game.contentManager.getGameSetting('timers', 'saveTicks') ?? 150;
  }

  // get all players. pretty sparingly used.
  public getAllPlayers(): Player[] {
    return Object.values(this.inGamePlayers);
  }

  // get a player in game based on the account username
  public getPlayerInGame(account: Account): Player | undefined {
    return this.getPlayerByUsername(account.username);
  }

  // get a player in game based on the account username
  public getPlayerByUsername(username: string): Player | undefined {
    return this.inGamePlayers[username];
  }

  // get a player state based on the player
  public getPlayerState(player: IPlayer): PlayerState | undefined {
    return this.playerStates?.[player?.username];
  }

  // add a player to the game
  public async addPlayerToGame(player: Player) {

    const username = player.username;
    this.inGamePlayers[username] = player;

    const state = new PlayerState();
    this.playerStates[username] = state;
    this.game.transmissionHelper.startWatching(player, state);

    this.game.playerHelper.resetStatus(player);
    this.updatePlayerData(player);
  }

  // remove a player from the game
  public async removePlayerFromGame(player: Player) {
    const username = player.username;
    delete this.inGamePlayers[username];
    delete this.playerStates[username];
    this.game.transmissionHelper.stopWatching(player);

    this.game.transmissionHelper.sendActionToAccount(username, GameAction.GameSetPlayer, { player: null });
  }

  // recalculate stats and do other sync related data
  public updatePlayerData(player: Player) {
    this.characterHelper.recalculateEverything(player);
  }

  private tick(timer, type: 'slow'|'fast', tick: number) {
    const now = Date.now();

    Object.values(this.inGamePlayers).forEach(player => {

      this.game.playerHelper.tick(player, type, tick);

      // effects tick at most once per second
      if (type === 'slow') {
        timer.startTimer(`slow-- ${player.username}/${player.name} --${now}`);
        this.game.effectHelper.tickEffects(player);
        timer.stopTimer(`slow-- ${player.username}/${player.name} --${now}`);
      }

      // not sure if this will be a good idea or not, we'll see
      if (type === 'fast') {
        timer.startTimer(`fast-- ${player.username}/${player.name}`);
        this.game.transmissionHelper.tryAutoPatchPlayer(player);
        timer.stopTimer(`fast-- ${player.username}/${player.name}`);
      }
    });
  }

  // save a single player
  public savePlayer(player: Player) {
    this.game.characterDB.savePlayer(player);
  }

  // save all players
  public saveAllPlayers() {
    const players = Object.values(this.inGamePlayers);
    if (players.length === 0) return;

    this.game.characterDB.saveAllPlayers(players);
  }

  // do a fast tick (200ms by default)
  public fastTick(timer, tick: number) {
    this.tick(timer, 'fast', tick);
  }

  // do a slow tick (1000ms by default)
  public slowTick(timer, tick: number) {
    this.tick(timer, 'slow', tick);

    this.currentSlowTick++;
    if ((this.currentSlowTick % this.saveTicks) === 0) {
      this.saveAllPlayers();
    }
  }

}
