
import { Injectable } from 'injection-js';
import { Collection, Db, MongoClient } from 'mongodb';
import { MongoPortable } from 'mongo-portable';
import { BaseService } from '../../models/BaseService';

import { BaseEntity } from '../../models/BaseEntity';
import { Account } from '../../models/orm/Account';
import { MetadataStorage } from './db/base';

@Injectable()
export class Database extends BaseService {

  private client: MongoClient;
  private pkgClient: MongoPortable;
  private db: Db;

  public async init() {}

  public async tryConnect(source: string) {
    if (process.env.pkg) {
      console.warn(`${source}:DB`, 'Package environment detected; using portable database.');
      this.pkgClient = new MongoPortable('landoftherair2', {});
      return;
    }

    const fallbackUri = 'mongodb://127.0.0.1:27017';

    if (!process.env.DATABASE_URI) {
      console.warn(`${source}:DB`, `No DATABASE_URI was specified, falling back to ${fallbackUri}`);
      process.env.DATABASE_URI = fallbackUri;
    }

    while (true) {
      try {
        console.info(`${source}:DB`, 'Connecting to database...');
        this.client = new MongoClient(process.env.DATABASE_URI as string, { useUnifiedTopology: true });
        await this.client.connect();
        await this.client.db('admin').command({ ping: 1 });
        console.info(`${source}:DB`, 'Database connection established...');
        break;
      } catch (e) {
        console.error(`${source}:DB`, `Database connection failed ${e.message}, retrying in 3 seconds...`);
        await this.client.close();
        await new Promise((resolve) => {
          setTimeout(() => resolve(null), 3000);
        } );
      }
    }

    this.db = this.client.db('landoftherair2');
  }

  public getCollection(entity): Collection {
    return this.getCollectionByName(MetadataStorage.getCollectionForEntity(entity));
  }

  public getCollectionByName(name: string): Collection {
    return this.db.collection(name);
  }

  public async findSingle<T>(T, filter): Promise<T | null> {
    const foundSingle = await this.getCollection(T).findOne(filter);
    if (!foundSingle) return null;

    const newSingle = new T();

    Object.keys(foundSingle).forEach(key => {
      newSingle[key] = foundSingle[key];
    });

    return newSingle;
  }

  public async removeSingle<T>(T, filter): Promise<any> {
    return this.getCollection(T).deleteOne(filter);
  }

  public async findUser(username: string): Promise<Account | null> {
    const coll = this.getCollectionByName('account');
    return await coll.findOne({ username });
  }

  public async findUserByEmail(email: string): Promise<Account | null> {
    const coll = this.getCollectionByName('account');
    return await coll.findOne({ email });
  }

  public async findMany<T>(T, filter): Promise<T[]> {
    const foundMany = await this.getCollection(T).find(filter).toArray();
    return foundMany.map(foundSingle => {
      const newSingle = new T();

      Object.keys(foundSingle).forEach(key => {
        newSingle[key] = foundSingle[key];
      });

      return newSingle;
    });
  }

  public getPersistObject(entity: BaseEntity): any {
    return MetadataStorage.getPersistObject(entity);
  }

  public async save(entity: BaseEntity): Promise<any> {
    const collection = this.getCollection(entity);
    return collection.replaceOne({ _id: entity._id }, this.getPersistObject(entity), { upsert: true });
  }

  public async delete(entity: BaseEntity): Promise<any> {
    const collection = this.getCollection(entity);
    return collection.findOneAndDelete({ _id: entity._id });
  }

  public prepareForTransmission(entity): any {
    return MetadataStorage.getEnumerableObject(entity);
  }

}
