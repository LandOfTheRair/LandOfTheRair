
export interface IAccountSettings {
  username: string;
  password: string;
  autologin?: boolean;
}

export type ChatMode = 'cmd' | 'say' | 'global' | 'party';

export enum GameOption {
  PinLastTarget = 'pinLastTarget',
  ShouldSortFriendly = 'shouldSortFriendly',
  ShouldSortDistance = 'shouldSortDistance'
}

export interface ISettings {
  accounts: IAccountSettings[];
  windows: { [key: string]: { x: number, y: number, width: number, height: number, hidden?: boolean } };
  activeWindow: string;
  charSlot: number;
  wasKicked: boolean;
  assetHash: string;
  chatMode: ChatMode;
  logMode: 'All'|'General'|'Combat'|'NPC';
  currentCommand: string;
  commandHistory: string[];
  characterView: 'Equipment'|'Stats'|'Skills';
  options: Record<GameOption, number|boolean>;
}
