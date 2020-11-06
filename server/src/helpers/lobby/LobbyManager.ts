
import { Injectable } from 'injection-js';

import { BaseService, IAccount } from '../../interfaces';
import { Account, Player } from '../../models';
import { WorldManager } from '../data';
import { PlayerManager } from '../game';

class LobbyState {
  users: IAccount[] = [];
  userHash: { [username: string]: IAccount } = {};
  usersInGame: { [username: string]: boolean } = {};
}

@Injectable()
export class LobbyManager extends BaseService {

  constructor(
    private playerManager: PlayerManager,
    private worldManager: WorldManager
  ) {
    super();
  }

  private state: LobbyState;

  public get usersInGame() {
    return this.state.usersInGame;
  }

  public get onlineUsers() {
    return this.state.users;
  }

  public init() {
    this.state = new LobbyState();
  }

  // add an account to the lobby
  public addAccount(account: Account): void {
    this.state.users.push(account);

    this.rebuildUserHash();
  }

  // get an account
  public getAccount(username: string): IAccount {
    return this.state.userHash[username];
  }

  // remove an account from the lobby
  public removeAccount(username: string): void {
    while (this.state.users.findIndex(x => x.username === username) !== -1) {
      this.state.users.splice(this.state.users.findIndex(x => x.username === username), 1);
    }

    delete this.state.usersInGame[username];

    this.rebuildUserHash();
  }

  // build a hash of users to their account objects
  private rebuildUserHash() {
    this.state.userHash = this.state.users.reduce((prev, cur) => {
      prev[cur.username] = cur;
      return prev;
    }, {});
  }

  // check if an account is in game
  public isAccountInGame(account: Account): boolean {
    return this.state.usersInGame[account.username];
  }

  // enter game as a particular player
  public accountEnterGame(account: Account, player: Player): void {
    this.state.usersInGame[account.username] = true;

    this.worldManager.checkPlayerForDoorsBeforeJoiningGame(player);
    this.playerManager.addPlayerToGame(player);
    this.worldManager.joinMap(player);
  }

  // leave the game
  public accountLeaveGame(account: Account): void {
    delete this.state.usersInGame[account.username];

    const player = this.playerManager.getPlayerInGame(account);
    this.worldManager.leaveMap(player);
    this.playerManager.savePlayer(player);
    this.playerManager.removePlayerFromGameByAccount(account);
  }
}
