
import { Singleton } from 'typescript-ioc';
import { IAccount } from '../../../interfaces';
import { Account } from '../../../models';

class LobbyState {
  motd = '';
  users: IAccount[] = [];
}

@Singleton
export class LobbyManager {

  private state!: LobbyState;

  public get motd() {
    return this.state.motd;
  }

  public get onlineUsers() {
    return this.state.users;
  }

  public init() {
    this.state = new LobbyState();
  }

  public addAccount(account: Account): void {
    this.state.users.push(account);
  }

  public removeAccount(username: string): void {
    const firstInst = this.state.users.findIndex(x => x.username === username);
    this.state.users.splice(firstInst, 1);
  }
}
