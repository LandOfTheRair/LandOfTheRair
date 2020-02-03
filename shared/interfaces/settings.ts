
export interface IAccountSettings {
  username: string;
  password: string;
  autologin?: boolean;
}

export type ChatMode = 'cmd' | 'say' | 'global' | 'party';

export interface ISettings {
  accounts: IAccountSettings[];
  windows: { [key: string]: { x: number, y: number, width: number, height: number, hidden?: boolean } };
  activeWindow: string;
  charSlot: number;
  wasKicked: boolean;
  assetHash: string;
  chatMode: ChatMode;
  logMode: 'General'|'Combat';
  currentCommand: string;
  commandHistory: string[];
}
