import { Injectable } from 'injection-js';

import { ObjectId } from 'mongodb';
import { GuildLevel, GuildRole } from '../../../interfaces';
import { Guild, Player } from '../../../models';
import { BaseService } from '../../../models/BaseService';
import { Database } from '../Database';

@Injectable()
export class GuildsDB extends BaseService {
  constructor(private db: Database) {
    super();
  }

  public async init() {
    const coll = this.db.getCollection(Guild);
    coll.createIndex({ tag: 1 }, { unique: true });
    coll.createIndex({ name: 1 }, { unique: true });
  }

  public async loadAllGuilds(): Promise<Guild[]> {
    return this.db.findMany<Guild>(Guild, {});
  }

  public async createGuild(
    owner: Player | undefined,
    name: string,
    tag: string,
  ): Promise<Guild | undefined> {
    const entry = new Guild();
    entry._id = new ObjectId();
    entry.timestamp = Date.now();

    entry.name = name;
    entry.tag = tag;
    entry.motd = `Welcome to ${name} [${tag}]!`;
    entry.treasury = 0;
    entry.level = GuildLevel.Basic;
    entry.members = {};

    if (owner) {
      this.game.guildManager.addGuildMember(entry, owner, GuildRole.Owner);
    }

    await this.db.save(entry);

    return entry;
  }

  public async saveGuild(guild: Guild): Promise<void> {
    return this.db.save(guild);
  }

  public async deleteGuild(guild: Guild): Promise<void> {
    return this.db.removeSingle<Guild>(Guild, { _id: new ObjectId(guild._id) });
  }
}
