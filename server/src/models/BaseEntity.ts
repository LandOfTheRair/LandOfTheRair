
import { ObjectId } from 'mongodb';
import { Property } from '../helpers/core/db/decorators';
import { PROP_SERVER_ONLY } from '../interfaces';

export abstract class BaseEntity {

  @Property(PROP_SERVER_ONLY()) _id: ObjectId;
  @Property(PROP_SERVER_ONLY()) createdAt = new Date();

}
