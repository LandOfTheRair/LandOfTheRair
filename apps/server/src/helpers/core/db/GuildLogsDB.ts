import { Injectable } from 'injection-js';
import { ObjectId } from 'mongodb';

import type { Guild } from '../../../models';
import { GuildLogEntry } from '../../../models';
import { BaseService } from '../../../models/BaseService';

@Injectable()
export class GuildLogsDB extends BaseService {
  public async init() {}

  public async addLogEntry(guild: Guild, action: string, actor: string) {
    const entry = new GuildLogEntry();
    entry._id = new ObjectId();
    entry.timestamp = Date.now();

    entry.guildId = guild._id;
    entry.guildName = guild.name;
    entry.guildTag = guild.tag;
    entry.action = action;
    entry.actor = actor;

    await this.game.db.save(entry);
  }

  public async getEntriesForGuild(guild: Guild) {
    return this.game.db.findMany<GuildLogEntry>(GuildLogEntry, {
      guildId: guild._id,
    });
  }
}
