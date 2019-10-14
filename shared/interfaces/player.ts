import { ICharacter } from './character';

export interface IPlayer extends ICharacter {
  charSlot: number;
}
