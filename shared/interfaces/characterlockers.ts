import { IItemContainer } from './character';

export interface ICharacterLockers {
  lockers: Record<string, Record<string, IItemContainer>>;    // region -> name -> items
}
