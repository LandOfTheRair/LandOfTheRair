
import { Injectable } from 'injection-js';
import { BaseService } from '../../../interfaces';
import { Ground } from '../../../models/orm/Ground';
import { Database } from '../Database';

@Injectable()
export class GroundDB extends BaseService {

  constructor(
    private db: Database
  ) {
    super();
  }

  public async init() {}

  public async loadAllGrounds(): Promise<Ground[]> {
    return this.db.findMany<Ground>(Ground, {});
  }

  public async saveSingleGround(ground: Ground): Promise<any> {
    return this.db.save(ground);
  }

  public async saveAllGrounds(grounds: Ground[]): Promise<any> {
    if (grounds.length === 0) return;

    const groundColl = this.db.getCollection(Ground);

    const massOp = groundColl.initializeUnorderedBulkOp();
    grounds.forEach(ground => {
      massOp.find({ map: ground.map }).upsert().updateOne({ $set: { ground: ground.ground, spawners: ground.spawners } });
    });

    return massOp.execute();
  }
}
