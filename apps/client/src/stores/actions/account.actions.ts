import {
  GameAction,
  Holiday,
  IAccount,
  ICharacter,
  IChatUser,
} from '@lotr/interfaces';

// dispatched when the user is fully logged in
export class Login {
  static type = GameAction.Login;
  constructor(
    public info: {
      motd: string;
      onlineUsers: IChatUser[];
      account: IAccount;
      currentHoliday: Holiday;
    },
  ) {}
}

// dispatched when the user is logged out (or kicked)
export class Logout {
  static type = GameAction.Logout;
  constructor(
    public manualDisconnect?: boolean,
    public kick?: boolean,
  ) {}
}

// dispatched when the user is fully logged in
export class SetAccount {
  static type = GameAction.SetAccount;
  constructor(public account: IAccount) {}
}

// dispatched by the server to set character information for a slot
export class SetCharacterSlotInformation {
  static type = GameAction.SetCharacterSlotInformation;
  constructor(
    public characterInfo: ICharacter,
    public slot: number,
  ) {}
}
