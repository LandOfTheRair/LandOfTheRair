import { ChatMode, GameAction, GameOption } from '../../interfaces';


// dispatched when an account is added to the quick login selector
export class AddAccount {
  static type = GameAction.SettingsAddAccount;
  constructor(public username: string, public password: string, public autologin?: boolean) {}
}

// dispatched when an account is removed from the quick login selector
export class RemoveAccount {
  static type = GameAction.SettingsRemoveAccount;
  constructor(public username: string) {}
}

// dispatched any time a window moves
export class UpdateWindowPosition {
  static type = GameAction.SettingsUpdateWindowPosition;
  filterOutFromLogs = true;
  constructor(
    public windowName: string,
    public windowProps: { x?: number; y?: number; width?: number; height?: number; hidden?: boolean },
    public overwrite?: boolean
  ) {}
}

// dispatched when a window is created
export class SetDefaultWindowPosition {
  static type = GameAction.SettingsSetDefaultWindowPosition;
  filterOutFromLogs = true;
  constructor(
    public windowName: string,
    public windowProps: { x?: number; y?: number  }
  ) {}
}

// dispatched when "reset window positions" set
export class ResetWindowPositions {
  static type = GameAction.SettingsResetWindowPositions;
  constructor() {}
}

// dispatched when a window is marked hidden
export class HideWindow {
  static type = GameAction.SettingsHideWindow;
  constructor(public windowName: string) {}
}

// dispatched when a window is shown
export class ShowWindow {
  static type = GameAction.SettingsShowWindow;
  filterOutFromLogs = true;
  constructor(public windowName: string) {}
}

// dispatched when a window is toggled
export class ToggleWindow {
  static type = GameAction.SettingsToggleWindow;
  filterOutFromLogs = true;
  constructor(public windowName: string) {}
}

// dispatched when a window is marked active (usually via click)
export class SetActiveWindow {
  static type = GameAction.SettingsActiveWindow;
  filterOutFromLogs = true;
  constructor(public windowName: string) {}
}

// dispatched when the user changes their currently active character slot
export class SetCharSlot {
  static type = GameAction.SettingsCharSlot;
  constructor(public charSlot: number) {}
}

// dispatched when the server sends the asset hash to the client
export class SetAssetHash {
  static type = GameAction.SettingsSetAssetHash;
  constructor(public assetHash: string) {}
}

// dispatched when the user changes their in game chat mode
export class SetChatMode {
  static type = GameAction.SettingsSetChatMode;
  constructor(public chatMode: ChatMode) {}
}

// dispatched when the user changes their in game log mode
export class SetLogMode {
  static type = GameAction.SettingsSetLogMode;
  constructor(public logMode: 'All'|'General'|'Combat'|'NPC') {}
}

// dispatched when a command happens, and is logged in history
export class LogCurrentCommandInHistory {
  static type = GameAction.LogCurrentCommand;
  filterOutFromLogs = true;
  constructor(public currentCommand: string) {}
}

// dispatched when something calls to set the current command, typing or otherwise
export class SetCurrentCommand {
  static type = GameAction.SetCurrentCommand;
  filterOutFromLogs = true;
  constructor(public command: string) {}
}

// dispatched to set any client game option
export class SetOption {
  static type = GameAction.SetOption;
  constructor(public option: GameOption, public value: boolean|number|string) {}
}

// dispatched when the user changes their character view
export class SetCharacterView {
  static type = GameAction.SettingsSetCharacterView;
  constructor(public charMode: 'Equipment'|'Stats'|'Skills'|'Reputation') {}
}

// dispatched when the user hits play game
export class SetLastCharSlotPlayed {
  static type = GameAction.SettingsLastPlayedCharSlot;
  constructor(public charSlot: number) {}
}
