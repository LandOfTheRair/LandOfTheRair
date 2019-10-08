
export interface IAccountSettings {
  username: string;
  password: string;
  autologin?: boolean;
}

export interface ISettings {
  accounts: IAccountSettings[];
  windows: { [key: string]: { x: number, y: number, width: number, height: number } };
  activeWindow: string;
  charSlot: number;
}
