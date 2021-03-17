
import { ObjectId } from 'bson';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { IItemContainer, ICharacterLockers, IMaterialStorage, ICharacterPouch } from '../../interfaces';
import { BaseEntity, PROP_SERVER_ONLY } from '../BaseEntity';

@Entity()
export class AccountLockers extends BaseEntity implements ICharacterLockers, IMaterialStorage, ICharacterPouch {

  // relation props
  @Property(PROP_SERVER_ONLY()) _account: ObjectId;

  // other props
  @Property() materials: Record<string, number>;
  @Property() lockers: Record<string, IItemContainer>;
  @Property() pouch: IItemContainer;

}
