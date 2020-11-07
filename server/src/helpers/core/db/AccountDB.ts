
import { wrap } from '@mikro-orm/core';

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

  public async doesAccountExist(username: string): Promise<Account | null> {
    return this.db.em.getRepository<Account>(Account).findOne({ username });
  }

  public async doesDiscordTagExist(discordTag: string): Promise<Account | null> {
    return this.db.em.getRepository<Account>(Account).findOne({ discordTag });
  }

  public async getAccount(username: string): Promise<Account | null> {
    const account = await this.db.em.getRepository<Account>(Account).findOne({ username }, ['players.items']);
    if (!account) return null;

    await account.players.populated();

    for (const player of account.players) {
      this.playerHelper.migrate(player);
    }

    return account;
  }

  public async createAccount(accountInfo: IAccount): Promise<Account | null> {

    const account = new Account();

    wrap(account).assign({
      username: accountInfo.username,
      email: accountInfo.email,
      password: this.bcryptPassword(accountInfo.password as string)
    });

    await this.db.save(account);

    return this.getAccount(account.username);
  }

  public async simpleAccount(account: Account): Promise<Partial<Account>> {
    const accountObj = await this.db.toObject(account);
    delete accountObj.password;
    delete accountObj.players;

    return accountObj;
  }

  public checkPassword(accountInfo: IAccount, account: Account): boolean {
    return this.checkPasswordString(account, accountInfo.password as string);
  }

  public checkPasswordString(account: Account, passwordCheck: string): boolean {
    return bcrypt.compareSync(passwordCheck, account.password);
  }

  public async changePassword(account: Account, newPassword: string): Promise<void> {
    account.password = this.bcryptPassword(newPassword);
    await this.db.save(account);
  }

  public async changeAlwaysOnline(account: Account, alwaysOnline: boolean): Promise<void> {
    account.alwaysOnline = alwaysOnline;
    await this.db.save(account);
  }

  public async changeDiscordTag(account: Account, discordTag: string): Promise<void> {

    if (discordTag) {
      const doesTagExist = await this.doesDiscordTagExist(discordTag);
      if (doesTagExist) throw new Error('Discord tag already taken.');
    }

    account.discordTag = discordTag;
    await this.db.save(account);
  }

  private bcryptPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

}
