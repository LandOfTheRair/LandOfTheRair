import {
  GameAction,
  ICharacterCreateInfo,
  IChatUser,
  IDynamicEvent,
  ISessionStatistics,
} from '@lotr/interfaces';

// dispatched when a new chat message is received
export class AddMessage {
  static type = GameAction.ChatAddMessage;
  constructor(
    public from: string,
    public message: string,
    public timestamp: number,
    public source: string,
  ) {}
}

// dispatched by the server when the user joins or the motd changes
export class SetMOTD {
  static type = GameAction.ChatSetMOTD;
  constructor(public motd: string) {}
}

// dispatched by the server when the user joins to set the user list
export class SetUsers {
  static type = GameAction.ChatSetUserList;
  constructor(public users: IChatUser[]) {}
}

// dispatched by the server when a new user joins the server
export class AddUser {
  static type = GameAction.ChatAddUser;
  constructor(public user: IChatUser) {}
}

// dispatched by the server when a user leaves the server
export class RemoveUser {
  static type = GameAction.ChatRemoveUser;
  constructor(public username: string) {}
}

// dispatched by the server on join to give character create info for creation
export class SetCharacterCreateInformation {
  static type = GameAction.SetCharacterCreateInformation;
  constructor(public charCreateInfo: ICharacterCreateInfo) {}
}

// dispatched when an account enters the game
export class AccountEnterGame {
  static type = GameAction.ChatUserEnterGame;
  constructor(public username: string) {}
}

// dispatched when an account leaves the game
export class AccountLeaveGame {
  static type = GameAction.ChatUserLeaveGame;
  constructor(public username: string) {}
}

// dispatched by the server when the user joins
export class SetEvents {
  static type = GameAction.EventSetList;
  constructor(public events: IDynamicEvent[]) {}
}

// dispatched by the server when an event starts
export class CreateEvent {
  static type = GameAction.EventCreate;
  constructor(public event: IDynamicEvent) {}
}

// dispatched by the server when an event ends
export class DeleteEvent {
  static type = GameAction.EventDelete;
  constructor(public event: IDynamicEvent) {}
}

// dispatched by the server when a player quits the game to lobby
export class SetSessionStatistics {
  static type = GameAction.SetSessionStatistics;
  constructor(public statistics: ISessionStatistics) {}
}
