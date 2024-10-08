import { Injectable } from 'injection-js';
import { ObjectId } from 'mongodb';

import { LogEntry } from '../../../models';
import { BaseService } from '../../../models/BaseService';
import { Database } from '../Database';

@Injectable()
export class LogsDB extends BaseService {
  constructor(private db: Database) {
    super();
  }

  public async init() {
    const coll = this.db.getCollection(LogEntry);

    // logs last for 3 days
    coll.createIndex({ message: 1 }, { expireAfterSeconds: 259200 });
  }

  public async addLogEntry(message: string, extraData = {}) {
    const entry = new LogEntry();
    entry._id = new ObjectId();
    entry.timestamp = Date.now();
    entry.message = message;
    entry.extraData = extraData;

    await this.db.save(entry);
  }
}
