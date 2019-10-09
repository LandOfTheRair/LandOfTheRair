import { ICharacter } from './character';

export interface IAccount {
  username: string;
  password?: string;
  email: string;
  players: ICharacter[];

  isGameMaster: boolean;
  isTester: boolean;
  isSubscribed: boolean;
  
  subscriptionEndsTimestamp: number;
  trialEndsTimestamp: number;
}
