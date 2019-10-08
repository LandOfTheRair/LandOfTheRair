
import path from 'path';

import { EntityManager, MikroORM } from 'mikro-orm';
import { Singleton } from 'typescript-ioc';

const isProd = process.env.NODE_ENV === 'production';

@Singleton
export class Database {

  private orm: MikroORM;

  public get em(): EntityManager {
    return this.orm.em;
  }

  public async init() {
    this.orm = await MikroORM.init({
      entitiesDirs: [(isProd ? 'dist' : 'src') + '/models/orm'],

      clientUrl: process.env.DATABASE_URI,
      autoFlush: false,
      dbName: 'landoftherair2'
    });
  }

}
