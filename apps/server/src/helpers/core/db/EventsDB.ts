import { Injectable } from 'injection-js';

import { DynamicEvent } from '../../../models';
import { BaseService } from '../../../models/BaseService';

@Injectable()
export class EventsDB extends BaseService {
  public async init() {
    const coll = this.game.db.getCollection(DynamicEvent);
    coll.createIndex({ name: 1 });
  }

  public async loadEvents(): Promise<DynamicEvent[]> {
    return this.game.db.findMany<DynamicEvent>(DynamicEvent, {});
  }

  public async createEvent(event: DynamicEvent) {
    await this.game.db.save(event);
  }

  public async deleteEvent(event: DynamicEvent) {
    await this.game.db.delete(event);
  }
}
