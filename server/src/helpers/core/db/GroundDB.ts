
import { Injectable } from 'injection-js';
import { BaseService } from '../../../models/BaseService';
import { Ground } from '../../../models/orm/Ground';
import { Database } from '../Database';

@Injectable()
export class GroundDB extends BaseService {

  constructor(
    private db: Database
  ) {
    super();
  }

  public async init() {
    const coll = this.db.getCollection(Ground);
    coll.createIndex({ map: 1, partyName: 1 }, { unique: true });
  }

  public async loadAllGrounds(): Promise<Ground[]> {
    return this.db.findMany<Ground>(Ground, {});
  }

  public async saveSingleGround(ground: Ground): Promise<any> {
    if (!ground) return;
    return this.saveAllGrounds([ground]);
  }

  public async removeAllGroundsByParty(partyName: string): Promise<any> {
    const groundColl = this.db.getCollection(Ground);
    return groundColl.deleteMany({ partyName });
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
