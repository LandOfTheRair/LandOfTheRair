
import { Injectable } from 'injection-js';

import { DynamicEvent } from '../../../models';
import { BaseService } from '../../../models/BaseService';
import { Database } from '../Database';

@Injectable()
export class EventsDB extends BaseService {

  constructor(
    private db: Database
  ) {
    super();
  }

  public async init() {
    const coll = this.db.getCollection(DynamicEvent);
    coll.createIndex({ name: 1 });
  }

  public async loadEvents(): Promise<DynamicEvent[]> {
    return this.db.findMany<DynamicEvent>(DynamicEvent, {});
  }

  public async createEvent(event: DynamicEvent) {
    await this.db.save(event);
  }

  public async deleteEvent(event: DynamicEvent) {
    await this.db.delete(event);
  }

}
