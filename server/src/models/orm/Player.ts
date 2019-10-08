
import { Entity, PrimaryKey } from 'mikro-orm';
import { ObjectID } from 'mongodb';

@Entity()
export class Player {

  @PrimaryKey()
  _id: ObjectID;
}
