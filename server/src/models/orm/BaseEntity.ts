
import { PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { PROP_SERVER_ONLY } from '../../interfaces';

export abstract class BaseEntity {

  @PrimaryKey(PROP_SERVER_ONLY()) _id!: ObjectId;
  @SerializedPrimaryKey(PROP_SERVER_ONLY()) id!: string;
  @Property(PROP_SERVER_ONLY()) createdAt = new Date();
  @Property({ hidden: true, onUpdate: () => new Date() }) updatedAt = new Date();

}
