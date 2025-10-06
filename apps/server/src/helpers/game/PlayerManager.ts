import { Injectable } from 'injection-js';

import type { ICharacter, IPlayer } from '@lotr/interfaces';
import { GameAction } from '@lotr/interfaces';
import type { Account, Player } from '../../models';
import { PlayerState } from '../../models';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class PlayerManager extends BaseService {
  private currentSlowTick = 0;
  private saveTicks = 150;

  private inGamePlayers: Record<string, Player> = {};
  private playerStates: Record<string, PlayerState> = {};

  public init() {
    this.saveTicks =
      this.game.contentManager.getGameSetting('timers', 'saveTicks') ?? 150;
  }

  // get the number of players online. pretty sparingly used.
  public numPlayersOnline(): number {
    return Object.values(this.inGamePlayers).length;
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

    this.game.transmissionHelper.sendActionToAccount(
      username,
      GameAction.GameSetPlayer,
      { player: null },
    );

    const char = player as ICharacter;
    if (char.takingOver) {
      delete char.takingOver.takenOverBy;
      delete char.takingOver;
    }
  }

  // recalculate stats and do other sync related data
  public updatePlayerData(player: Player) {
    this.game.characterHelper.recalculateEverything(player);
  }

  private tick(timer, type: 'slow' | 'fast', tick: number) {
    const now = Date.now();

    Object.values(this.inGamePlayers).forEach((player) => {
      // effects tick at most once per second
      if (type === 'slow') {
        timer.startTimer(`slow-- ${player.username}/${player.name} --${now}`);
        this.game.effectHelper.tickEffects(player);
        timer.stopTimer(`slow-- ${player.username}/${player.name} --${now}`);
      }

      // tick the rest of the player aspects
      this.game.playerHelper.tick(player, type, tick);

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
    if (this.currentSlowTick % this.saveTicks === 0) {
      this.saveAllPlayers();
    }
  }
}
