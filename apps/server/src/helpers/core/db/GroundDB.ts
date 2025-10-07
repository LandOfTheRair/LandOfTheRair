import { consoleError } from '@lotr/logger';
import { Injectable } from 'injection-js';
import { BaseService } from '../../../models/BaseService';
import { Ground } from '../../../models/orm/Ground';

@Injectable()
export class GroundDB extends BaseService {
  public async init() {
    const coll = this.game.db.getCollection(Ground);
    coll.createIndex({ map: 1, partyName: 1 }, { unique: true });
  }

  public async loadAllGrounds(): Promise<Ground[]> {
    return this.game.db.findMany<Ground>(Ground, {});
  }

  public async saveSingleGround(ground: Ground): Promise<any> {
    if (!ground) return;
    return this.saveAllGrounds([ground]);
  }

  public async removeGround(map: string): Promise<any> {
    const groundColl = this.game.db.getCollection(Ground);
    return groundColl.deleteOne({ map });
  }

  public async removeAllGroundsByParty(partyName: string): Promise<any> {
    const groundColl = this.game.db.getCollection(Ground);
    return groundColl.deleteMany({ partyName });
  }

  public async saveAllGrounds(grounds: Ground[]): Promise<any> {
    grounds = grounds.filter(
      (x) =>
        !this.game.worldManager.isDungeon(x.map) ||
        (this.game.worldManager.isDungeon(x.map) && x.partyName),
    );
    if (grounds.length === 0) return;

    const groundColl = this.game.db.getCollection(Ground);

    const massOp = groundColl.initializeUnorderedBulkOp();
    grounds.forEach((ground) => {
      massOp
        .find({ map: ground.map })
        .upsert()
        .updateOne({
          $set: {
            ground: ground.ground,
            spawners: ground.spawners,
            savedAt: Date.now(),
          },
        });
    });

    try {
      return await massOp.execute();
    } catch (e) {
      consoleError(
        'GroundSave',
        e as Error,
        `There was an error saving the ground. Typically, this is some awkward error with Solokar and not having a party name.`,
      );
    }
  }
}
