import bcrypt from 'bcrypt';
import { Injectable } from 'injection-js';
import { cloneDeep, merge, pick } from 'lodash';
import { ObjectId } from 'mongodb';

import type { IAccount } from '@lotr/interfaces';
import { SubscriptionTier } from '@lotr/interfaces';
import { premiumMaxCharacters } from '@lotr/premium';
import { Account, AccountPremium } from '../../../models';
import { BaseService } from '../../../models/BaseService';

@Injectable()
export class AccountDB extends BaseService {
  public async init() {
    const coll = this.game.db.getCollection(Account);
    coll.createIndex({ username: 1 }, { unique: true });
    coll.createIndex({ email: 1 }, { unique: true });
  }

  public async doesAccountExist(username: string): Promise<Account | null> {
    return this.game.db
      .getCollection(Account)
      .findOne({ username }, { projection: { username: 1 } });
  }

  public async doesAccountExistEmail(email: string): Promise<Account | null> {
    return this.game.db
      .getCollection(Account)
      .findOne({ email }, { projection: { email: 1 } });
  }

  public async doesDiscordTagExist(
    discordTag: string,
  ): Promise<Account | null> {
    return this.game.db
      .getCollection(Account)
      .findOne({ discordTag }, { projection: { username: 1 } });
  }

  // get an unpopulated account for login purposes
  // possibly this should take in a password and query the db instead of doing the checks later
  public async getAccountForLoggingIn(
    username: string,
  ): Promise<Account | null> {
    return this.game.db
      .getCollection(Account)
      .findOne(
        { username },
        { projection: { username: 1, password: 1, temporaryPassword: 1 } },
      );
  }

  public async getAccountUsernameForEmail(email: string): Promise<string> {
    const account = await this.game.db.findSingle<Account>(Account, { email });
    if (!account) return '';

    return account.username;
  }

  // get a fully populated account object post-signin validation
  public async getAccount(username: string): Promise<Account | null> {
    const account = await this.game.db.findSingle<Account>(Account, {
      username,
    });
    if (!account) return null;

    const players = await this.game.characterDB.loadPlayers(account);
    account.players = players;

    if (!account.originalEmail) account.originalEmail = account.email;

    let [premium] = await Promise.all([
      this.game.db.findSingle<AccountPremium>(AccountPremium, {
        _account: account._id,
      }),
    ]);

    if (!premium) {
      const newPrem = new AccountPremium();
      newPrem._id = new ObjectId();
      newPrem._account = account._id;
      newPrem.subscriptionTier = SubscriptionTier.None;
      newPrem.silver = 0;
      newPrem.silverPurchases = {};

      premium = newPrem;
    }

    account.premium = premium;

    // post-load setup
    const maxPlayers = premiumMaxCharacters(account, 4);
    if (account.players.length < maxPlayers) {
      account.players.length = maxPlayers;
    }

    return account;
  }

  // register an IP with an account
  public async registerIP(username: string, ip: string): Promise<any> {
    return this.game.db
      .getCollection(Account)
      .updateOne({ username }, { $addToSet: { ips: ip } });
  }

  // create a new account from the info given
  public async createAccount(accountInfo: IAccount): Promise<Account | null> {
    const account = new Account();
    account._id = new ObjectId();

    const checkUsernameAccount = await this.game.db.findSingle<Account>(
      Account,
      {
        username: { $regex: `^${accountInfo.username}$`, $options: 'i' },
      },
    );
    if (checkUsernameAccount) return null;

    const checkEmailAccount = await this.game.db.findSingle<Account>(Account, {
      email: { $regex: `^${accountInfo.email}$`, $options: 'i' },
    });
    if (checkEmailAccount) return null;

    merge(account, {
      username: accountInfo.username,
      email: accountInfo.email,
      password: this.bcryptPassword(accountInfo.password as string),
    });

    await this.saveAccount(account);

    return this.getAccount(account.username);
  }

  public simpleAccount(account: Account): Partial<Account> {
    const accountObj = cloneDeep(account);
    return pick(accountObj, [
      'alwaysOnline',
      'eventWatcher',
      'isGameMaster',
      'premium.subscriptionTier',
      'isTester',
      'username',
    ]);
  }

  private bcryptPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  public checkPassword(accountInfo: IAccount, account: Account): boolean {
    return (
      this.checkPasswordString(account, accountInfo.password as string) ||
      !!(
        account.temporaryPassword &&
        accountInfo.password === account.temporaryPassword
      )
    );
  }

  public checkPasswordString(account: Account, passwordCheck: string): boolean {
    return bcrypt.compareSync(passwordCheck, account.password);
  }

  public async saveAccount(account: Account): Promise<void> {
    const promises = [this.game.db.save(account)];

    if (account.premium) {
      promises.push(this.game.db.save(account.premium as AccountPremium));
    }

    await Promise.all(promises);
  }

  public async changePassword(
    account: Account,
    newPassword: string,
  ): Promise<void> {
    account.password = this.bcryptPassword(newPassword);
    await this.saveAccount(account);
  }

  public async changeEmail(account: Account, newEmail: string): Promise<void> {
    account.email = newEmail;
    account.emailVerified = false;
    await this.saveAccount(account);
  }

  public async verifyEmail(account: Account): Promise<void> {
    account.emailVerified = true;
    await this.saveAccount(account);
  }

  public async changeAlwaysOnline(
    account: Account,
    alwaysOnline: boolean,
  ): Promise<void> {
    account.alwaysOnline = alwaysOnline;
    await this.saveAccount(account);
  }

  public async changeEventWatcher(
    account: Account,
    eventWatcher: boolean,
  ): Promise<void> {
    account.eventWatcher = eventWatcher;
    await this.saveAccount(account);
  }

  public async toggleTester(account: Account): Promise<void> {
    account.isTester = !account.isTester;
    await this.saveAccount(account);
  }

  public async toggleGM(account: Account): Promise<void> {
    account.isGameMaster = !account.isGameMaster;
    await this.saveAccount(account);
  }

  public async toggleMute(account: Account): Promise<void> {
    account.isMuted = !account.isMuted;
    await this.saveAccount(account);
  }

  public async ban(account: Account): Promise<void> {
    account.isBanned = true;
    await this.saveAccount(account);
  }

  public async changeDiscordTag(
    account: Account,
    discordTag: string,
  ): Promise<void> {
    if (discordTag) {
      const doesTagExist = await this.doesDiscordTagExist(discordTag);
      if (doesTagExist) throw new Error('Discord tag already taken.');
    }

    account.discordTag = discordTag;
    await this.saveAccount(account);
  }

  public async setTemporaryPassword(
    email: string,
    password: string,
  ): Promise<any> {
    return this.game.db
      .getCollection(Account)
      .updateOne({ email }, { $set: { temporaryPassword: password } });
  }
}
