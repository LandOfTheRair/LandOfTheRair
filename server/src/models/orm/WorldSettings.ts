
import { Entity, IEntity, PrimaryKey, Property } from 'mikro-orm';
import { ObjectID } from 'mongodb';


@Entity()
export class WorldSettings {

  @PrimaryKey() _id: ObjectID;

  @Property() motd = '';

}

export interface WorldSettings extends IEntity<string> {}
