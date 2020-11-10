
import { ObjectId } from 'mongodb';
import { PROP_SERVER_ONLY } from '../../../../interfaces';
import { Property } from '../decorators';

export abstract class BaseEntity {

  @Property(PROP_SERVER_ONLY()) _id: ObjectId;
  @Property(PROP_SERVER_ONLY()) createdAt = new Date();

}
