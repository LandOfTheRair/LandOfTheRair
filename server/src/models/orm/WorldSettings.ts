
import { Entity, MongoEntity, PrimaryKey, Property, SerializedPrimaryKey } from 'mikro-orm';
import { ObjectID } from 'mongodb';


@Entity()
export class WorldSettings implements MongoEntity<WorldSettings> {

  @PrimaryKey() _id: ObjectID;
  @SerializedPrimaryKey() id: string;

  @Property() motd = '';

}
