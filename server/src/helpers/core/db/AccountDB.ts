
import bcrypt from 'bcrypt';
import { Inject, Singleton } from 'typescript-ioc';

import { BaseService, IAccount } from '../../../interfaces';
import { Account } from '../../../models';
import { Database } from '../Database';

@Singleton
export class AccountDB extends BaseService {

  @Inject private db: Database;

  public async init() {}

  public async getAccount(username: string): Promise<Account | null> {
    const account = await this.db.em.getRepository<Account>(Account).findOne({ username }, ['players']);
    await account?.players.init();

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
