
import bcrypt from 'bcrypt';
import { Injectable } from 'injection-js';

import { BaseService, IAccount } from '../../../interfaces';
import { Account } from '../../../models';
import { PlayerHelper } from '../../character';
import { Database } from '../Database';

@Injectable()
export class AccountDB extends BaseService {

  constructor(
    private db: Database,
    private playerHelper: PlayerHelper
  ) {
    super();
  }

  public async init() {}

  public async getAccount(username: string): Promise<Account | null> {
    const account = await this.db.em.getRepository<Account>(Account).findOne({ username });
    await account?.players.init();

    for (const player of account!.players) {
      this.playerHelper.migrate(player);
    }

    return account;
  }

  public async createAccount(accountInfo: IAccount): Promise<Account | null> {

    const account = new Account();

    account.username = accountInfo.username;
    account.email = accountInfo.email;
    account.password = bcrypt.hashSync(accountInfo.password, 10);

    await this.db.save(account);

    return account;
  }

  public async simpleAccount(account: Account) {
    return this.db.toObject(account);
  }

  public checkPassword(accountInfo: IAccount, account: Account): boolean {
    return bcrypt.compareSync(accountInfo.password, account.password);
  }

}
