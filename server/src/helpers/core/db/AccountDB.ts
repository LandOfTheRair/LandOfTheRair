
import bcrypt from 'bcrypt';
import { Inject, Singleton } from 'typescript-ioc';

import { IAccount } from '../../../interfaces';
import { Account } from '../../../models';
import { Database } from '../Database';

@Singleton
export class AccountDB {

  @Inject private db!: Database;

  public async getAccount(username: string): Promise<Account | null> {
    const res = this.db.em.getRepository<Account>(Account).findOne({ username });
    return res;
  }

  public async createAccount(accountInfo: IAccount): Promise<Account | null> {

    const account = new Account();

    account.username = accountInfo.username;
    account.email = accountInfo.email;
    account.password = bcrypt.hashSync(accountInfo.password, 10);

    await this.db.em.persist(account, true);

    return account;
  }

  public checkPassword(accountInfo: IAccount, account: Account): boolean {
    return bcrypt.compareSync(accountInfo.password, account.password);
  }

}
