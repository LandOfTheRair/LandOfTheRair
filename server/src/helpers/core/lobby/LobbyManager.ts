
import { Inject, Singleton } from 'typescript-ioc';
import { IAccount } from '../../../interfaces';
import { Account } from '../../../models';
import { WorldDB } from '../db';

class LobbyState {
  users: IAccount[] = [];
  userHash: { [username: string]: IAccount } = {};
}

@Singleton
export class LobbyManager {

  @Inject private worldDB!: WorldDB;

  private state!: LobbyState;

  public get motd() {
    return this.worldDB.motd;
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

    this.rebuildUserHash();
  }

  private rebuildUserHash() {
    this.state.userHash = this.state.users.reduce((prev, cur) => {
      prev[cur.username] = cur;
      return prev;
    }, {});
  }
}
