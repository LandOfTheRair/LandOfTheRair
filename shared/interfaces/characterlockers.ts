import { IItemContainer } from './character';

export interface ICharacterLockers {
  lockers: Record<string, IItemContainer>;    // name -> items
}

export interface IMaterialStorage {
  materials: Record<string, number>;
}
