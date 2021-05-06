
import { Entity, Property } from '../../helpers/core/db/decorators';
import { IGround, ISerializableSpawner } from '../../interfaces';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class Ground extends BaseEntity {

  @Property() map: string;
  @Property() ground: IGround;
  @Property() spawners: ISerializableSpawner[];
  @Property() partyName?: string;
  @Property() treasureChests: Record<string, boolean>;
  @Property() savedAt: number;

}
