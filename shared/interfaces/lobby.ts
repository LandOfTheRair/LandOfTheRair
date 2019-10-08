
export enum SubscriptionTier {
  None = 0,
  Trial = 1,
  Normal = 5,
  Tester = 7,
  GM = 10
}

export interface ICharacterCreateInfo {
  allegiances: Array<{ description: string, name: string, statMods: Array<{ name: string, value: number }> }>;
  baseStats: Array<{ name: string, value: number }>;
  classes: Array<{ description: string, name: string, statMods: Array<{ name: string, value: number }> }>;
}

export interface IChatMessage {
  from: string;
  message: string;
  timestamp: number;
}

export interface IChatUser {
  inGame?: boolean;
  hasDoneTrial: boolean;
  isGameMaster: boolean;
  isTester: boolean;
  subscriptionTier: number;
  trialEndsUnixTimestamp: number;
  username: string;

  tier?: number;
}

export interface ILobbyContainer {
  messages: IChatMessage[];
  users: IChatUser[];
  motd: string;
  charCreate: ICharacterCreateInfo;
}
