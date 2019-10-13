
import { AnyEntity, Entity, MongoEntity, PrimaryKey, Property } from 'mikro-orm';
import { SerializedPrimaryKey } from 'mikro-orm/dist/decorators';
import { ObjectID } from 'mongodb';


@Entity()
export class WorldSettings implements MongoEntity<WorldSettings> {

  @PrimaryKey() _id: ObjectID;
  @SerializedPrimaryKey() id: string;

  @Property() motd = '';

}
