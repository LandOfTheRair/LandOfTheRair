
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

  public addAccount(account: Account): void {
    this.state.users.push(account);

    this.rebuildUserHash();
  }

  public getAccount(username: string): IAccount {
    return this.state.userHash[username];
  }

  public removeAccount(username: string): void {
    const firstInst = this.state.users.findIndex(x => x.username === username);
    this.state.users.splice(firstInst, 1);

    delete this.state.usersInGame[username];

    this.rebuildUserHash();
  }

  private rebuildUserHash() {
    this.state.userHash = this.state.users.reduce((prev, cur) => {
      prev[cur.username] = cur;
      return prev;
    }, {});
  }

  public isAccountInGame(account: Account): boolean {
    return this.state.usersInGame[account.username];
  }

  public accountEnterGame(account: Account, player: Player): void {
    this.state.usersInGame[account.username] = true;

    this.playerManager.addPlayerToGame(player);
    this.worldManager.joinMap(player);
  }

  public accountLeaveGame(account: Account): void {
    delete this.state.usersInGame[account.username];

    const player = this.playerManager.getPlayerInGame(account);
    this.worldManager.leaveMap(player);
    this.playerManager.savePlayer(player);
    this.playerManager.removePlayerFromGameByAccount(account);
  }
}
