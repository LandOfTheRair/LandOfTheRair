
export interface IAccount {
  username: string;
  password?: string;
  email: string;

  players: any;

  isGameMaster: boolean;
  isTester: boolean;
  isSubscribed: boolean;

  isMuted: boolean;
  isBanned: boolean;

  subscriptionEndsTimestamp: number;
  trialEndsTimestamp: number;

  discordTag: string;
  alwaysOnline: boolean;
  eventWatcher: boolean;
}
