
import { Injectable } from 'injection-js';
import { BaseService, IGround } from '../../../interfaces';
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

  public loadAllGrounds(): Promise<Ground[]> {
    return this.db.findMany<Ground>(Ground, {});
  }

  public saveSingleGround(ground: Ground): Promise<any> {
    return this.db.save(ground);
  }

  // TODO: bulk save players like this
  public saveAllGrounds(grounds: Ground[]): Promise<any> {
    const groundColl = this.db.getCollection(Ground);

    const massOp = groundColl.initializeUnorderedBulkOp();
    grounds.forEach(ground => {
      massOp.find({ map: ground.map }).upsert().updateOne({ $set: { ground: ground.ground } });
    });

    return massOp.execute();
  }
}
