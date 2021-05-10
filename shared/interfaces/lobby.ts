import { IAccount } from './account';
import { IDynamicEvent } from './dynamicevent';

export interface ICharacterCreateInfo {
  allegiances: Array<{ description: string; name: string; statMods: Array<{ name: string; value: number }> }>;
  baseStats: Array<{ name: string; value: number }>;
  classes: Array<{ description: string; name: string; statMods: Array<{ name: string; value: number }> }>;
}

export interface IChatMessage {
  from: string;
  message: string;
  timestamp: number;
  source: string;
}

export type IChatUser = IAccount & {
  inGame?: boolean;
  tier?: number;
};

export interface ILobbyContainer {
  messages: IChatMessage[];
  users: IChatUser[];
  events: IDynamicEvent[];
  motd: string;
  charCreate: ICharacterCreateInfo;
}
