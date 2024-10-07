import { Injectable } from 'injection-js';
import { ObjectId } from 'mongodb';

import { Guild, GuildLogEntry } from '../../../models';
import { BaseService } from '../../../models/BaseService';
import { Database } from '../Database';

@Injectable()
export class GuildLogsDB extends BaseService {
  constructor(private db: Database) {
    super();
  }

  public async init() {}

  public async addLogEntry(guild: Guild, action: string, actor: string) {
    const entry = new GuildLogEntry();
    entry._id = new ObjectId();
    entry.createdAt = new Date();

    entry.guildId = guild._id;
    entry.action = action;
    entry.actor = actor;

    await this.db.save(entry);
  }

  public async getEntriesForGuild(guild: Guild) {
    return this.db.findMany<GuildLogEntry>(GuildLogEntry, {
      guildId: guild._id,
    });
  }
}
