
import bcrypt from 'bcrypt';
import { Injectable } from 'injection-js';
import { cloneDeep, merge, pick } from 'lodash';
import { ObjectId } from 'mongodb';

import { BaseService, IAccount } from '../../../interfaces';
import { Account, Player } from '../../../models';
import { PlayerItems } from '../../../models/orm/PlayerItems';
import { Database } from '../Database';

@Injectable()
export class AccountDB extends BaseService {

  constructor(
    private db: Database
  ) {
    super();
  }

  public async init() {}

  public async doesAccountExist(username: string): Promise<Account | null> {
    return this.db.getCollection(Account).findOne({ username }, { projection: { username: 1 } });
  }

  public async doesDiscordTagExist(discordTag: string): Promise<Account | null> {
    return this.db.getCollection(Account).findOne({ discordTag }, { projection: { username: 1 } });
  }

  // get an unpopulated account for login purposes
  // possibly this should take in a password and query the db instead of doing the checks later
  public async getAccountForLoggingIn(username: string): Promise<Account | null> {
    return this.db.getCollection(Account).findOne({ username }, { projection: { username: 1, password: 1 } });
  }

  // get a fully populated account object post-signin validation
  public async getAccount(username: string): Promise<Account | null> {
    const account = await this.db.findSingle<Account>(Account, { username });
    if (!account) return null;

    const players = await this.game.characterDB.loadPlayers(account);

    account.players = players;
    if (account.players.length < 4) account.players.length = 4;

    return account;
  }

  public async createAccount(accountInfo: IAccount): Promise<Account | null> {

    const account = new Account();

    merge(account, {
      username: accountInfo.username,
      email: accountInfo.email,
      password: this.bcryptPassword(accountInfo.password as string)
    });

    await this.db.save(account);

    return this.getAccount(account.username);
  }

  public simpleAccount(account: Account): Partial<Account> {
    const accountObj = cloneDeep(account);
    return pick(accountObj, ['alwaysOnline', 'isGameMaster', 'isSubscribed', 'isTester', 'tier', 'username']);
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
