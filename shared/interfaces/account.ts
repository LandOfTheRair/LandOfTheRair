import { ICharacter } from './character';

export interface IAccount {
  username: string;
  email: string;
  players: ICharacter[];
}
