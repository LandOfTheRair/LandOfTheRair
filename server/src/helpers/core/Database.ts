
import { Injectable } from 'injection-js';

import { AnyEntity, EntityManager, EntityName, MikroORM, wrap } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

import { BaseService } from '../../interfaces';
import { BaseEntity } from '../../models/orm/BaseEntity';

const isProd = process.env.NODE_ENV === 'production';

@Injectable()
export class Database extends BaseService {

  private orm: MikroORM;

  public get em(): EntityManager {
    return this.orm.em;
  }

  public async init() {
    this.orm = await MikroORM.init<MongoDriver>({
      metadataProvider: TsMorphMetadataProvider,
      entities: [(isProd ? 'dist' : 'src') + '/models/orm'],
      entitiesTs: ['src/models/orm'],

      clientUrl: process.env.DATABASE_URI,
      dbName: 'landoftherair2',
      type: 'mongo',
      driverOptions: { useUnifiedTopology: true }
    });

    [
      'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
      'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(sig => {
      process.on(sig as any, async () => {
        await this.flush();
        process.exit(1);
      });
    });
  }

  public async toObject<T>(entity: AnyEntity<T>) {
    const obj = await wrap(entity);
    return obj.toObject();
  }

  public wrap<T>(entity: AnyEntity<T>) {
    return wrap(entity);
  }

  public async flush() {
    this.em.flush();
  }

  public create<T>(entity: EntityName<T>, data = {}): T {
    return this.em.create(entity, data);
  }

  public save(entity: BaseEntity) {
    return this.em.persistAndFlush(entity);
  }

  public delete(entity: BaseEntity) {
    return this.em.removeAndFlush(entity);
  }

}
