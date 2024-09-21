import * as crypto from 'crypto';
import { Injectable } from 'injection-js';
import { ObjectId } from 'mongodb';

import { chunk } from 'lodash';
import { Redeemable } from '../../../models';
import { BaseService } from '../../../models/BaseService';
import { Database } from '../Database';

@Injectable()
export class RedeemableDB extends BaseService {
  constructor(private db: Database) {
    super();
  }

  public async init() {
    const coll = this.db.getCollection(Redeemable);
    coll.createIndex({ code: 1 }, { unique: true });
  }

  private generateCode(): string {
    return chunk(crypto.randomBytes(10).toString('hex'), 5)
      .map((x) => x.join(''))
      .join('-')
      .toUpperCase();
  }

  public async addRedeemable(opts: Partial<Redeemable>): Promise<Redeemable> {
    const entry = new Redeemable();
    entry._id = new ObjectId();
    entry.createdAt = new Date();
    entry.code = this.generateCode();
    entry.claimedBy = [];

    if (opts.forAccountName) {
      entry.forAccountName = opts.forAccountName;
    }

    if (opts.expiresAt) {
      entry.expiresAt = opts.expiresAt;
    }

    if (opts.maxUses) {
      entry.maxUses = opts.maxUses;
    }

    if (opts.item) {
      entry.item = opts.item;
    }

    if (opts.gold) {
      entry.gold = opts.gold;
    }

    if (!opts.item && !opts.gold) {
      throw new Error('Invalid redeemable; would result in nothing.');
    }

    await this.db.save(entry);

    return entry;
  }

  public async getRedeemable(code: string): Promise<Redeemable | null> {
    return this.db.findSingle<Redeemable>(Redeemable, { code });
  }

  public async claimRedeemable(
    code: string,
    claimingAccount: string,
  ): Promise<Redeemable> {
    const redeemable = await this.db.findSingle<Redeemable>(Redeemable, {
      code,
    });
    if (!redeemable) {
      throw new Error('Code is not valid.');
    }

    if (
      redeemable.maxUses &&
      redeemable.claimedBy.length >= redeemable.maxUses &&
      redeemable.maxUses !== -1
    ) {
      throw new Error('Maximum uses for code.');
    }

    if (redeemable.expiresAt && Date.now() > redeemable.expiresAt) {
      throw new Error('Code has expired.');
    }

    if (
      redeemable.forAccountName &&
      claimingAccount !== redeemable.forAccountName
    ) {
      throw new Error('You cannot claim this code.');
    }

    if (redeemable.claimedBy.includes(claimingAccount)) {
      throw new Error('You have already claimed this code.');
    }

    await this.game.marketDB.createPickupFromRedeemable(
      claimingAccount,
      redeemable,
    );

    redeemable.claimedBy.push(claimingAccount);

    await this.db.save(redeemable);

    return redeemable;
  }
}
