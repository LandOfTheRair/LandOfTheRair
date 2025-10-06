import { Injectable } from 'injection-js';
import { ObjectId } from 'mongodb';

import { LogEntry } from '../../../models';
import { BaseService } from '../../../models/BaseService';

@Injectable()
export class LogsDB extends BaseService {
  public async init() {
    const coll = this.game.db.getCollection(LogEntry);

    // logs last for 3 days
    coll.createIndex({ message: 1 }, { expireAfterSeconds: 259200 });
  }

  public async addLogEntry(message: string, extraData = {}) {
    const entry = new LogEntry();
    entry._id = new ObjectId();
    entry.timestamp = Date.now();
    entry.message = message;
    entry.extraData = extraData;

    await this.game.db.save(entry);
  }
}
