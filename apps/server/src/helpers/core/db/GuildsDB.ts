import { Injectable } from 'injection-js';

import { GuildLevel, GuildRole } from '@lotr/interfaces';
import { ObjectId } from 'mongodb';
import type { Player } from '../../../models';
import { Guild } from '../../../models';
import { BaseService } from '../../../models/BaseService';

@Injectable()
export class GuildsDB extends BaseService {
  public async init() {
    const coll = this.game.db.getCollection(Guild);
    coll.createIndex({ tag: 1 }, { unique: true });
    coll.createIndex({ name: 1 }, { unique: true });
  }

  public async loadAllGuilds(): Promise<Guild[]> {
    return this.game.db.findMany<Guild>(Guild, {});
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

    await this.game.db.save(entry);

    return entry;
  }

  public async saveGuild(guild: Guild): Promise<void> {
    return this.game.db.save(guild);
  }

  public async deleteGuild(guild: Guild): Promise<void> {
    return this.game.db.removeSingle<Guild>(Guild, {
      _id: new ObjectId(guild._id),
    });
  }
}
