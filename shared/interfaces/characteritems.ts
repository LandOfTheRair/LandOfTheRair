import { ItemSlot } from './building-blocks';
import { IItemContainer } from './character';
import { ISimpleItem } from './item';


export interface ICharacterItems {
  equipment: { [key in ItemSlot]?: ISimpleItem };

  sack: IItemContainer;
  belt: IItemContainer;

  buyback: ISimpleItem[];
}
