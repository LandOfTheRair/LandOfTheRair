import { IAccount, ICharacter } from '../../interfaces';

export class Account implements IAccount {

  username: string;
  email: string;
  players: ICharacter[];

}
